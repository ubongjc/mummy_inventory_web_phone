# Rental Inventory & Calendar App — plan.md

> A modern, simple web app to track rental stock (tables, chairs, plates, etc.), see availability on a calendar, and drill into any day to view who rented what and when items return. Optimized for a new repo + quick free-tier deployment.

---

## 1) Objectives

* Track **current stock** and **remaining quantity** for each item.
* **Calendar view** (Month/Week/Day) shows active rentals and quantities reserved per day.
* Clicking a **calendar day** opens a details panel: all rentals on that day, renter contact, due/return dates, and **per‑item remaining** for that date.
* Prevent overbooking: the system warns/blocks rental creation if stock would go negative for any day in the rental window.
* Free to start; deploy in <30 minutes on common free tiers.

---

## 2) Tech Stack (current, fast, free‑tier friendly)

* **Frontend/SSR/Hosting:** Next.js 15 (App Router) + React 18 + TypeScript, deployed on **Vercel** (free tier).
* **UI:** Tailwind CSS + Headless UI/Radix for primitives. Icons via Lucide.
* **Calendar:** **FullCalendar React** (rich resource & day grid) or **React Big Calendar**. We’ll use **FullCalendar** for ecosystem maturity.
* **DB:** **PostgreSQL (Neon)** free tier (serverless, generous free credits). Alternative: Supabase (also works great).
* **ORM:** Prisma 5 (typed client, migrations, accelerate on Vercel optional).
* **Auth (optional, can skip for MVP):** NextAuth with Email/Password (or Clerk free tier). MVP can use a single admin user with password.
* **Validation:** Zod schemas on both client/server.
* **Dates:** date‑fns + timezone handling (store UTC in DB, format client‑side).
* **Testing:** Vitest + Playwright (e2e) + Prisma test environment.

---

## 3) Core Domain Model

We keep it minimal but future‑proof for multi‑day, partial‑quantity rentals.

**Entities**

* **Item**: tableware/furniture inventory SKU (e.g., “Table 6ft”).
* **Customer**: who is renting (name, phone, email).
* **Rental**: a booking spanning a start & end date (inclusive), with a status.
* **RentalItem**: line items per rental with quantities.
* *(Optional)* **StockAdjustment**: manual adds/subtractions (damaged, found stock). MVP can store `Item.totalQuantity` and adjust directly; an adjustments table is cleaner long‑term.

**Availability Rule**

> For any date `d`, an item’s available quantity is:
> `available(d, item) = item.totalQuantity − Σ rentalItem.qty` for all **active** rentals where `rental.startDate ≤ d ≤ rental.endDate` and `rental.status ∈ {CONFIRMED, OUT}`.

---

## 4) Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RentalStatus {
  DRAFT
  CONFIRMED
  OUT      // picked up / currently out
  RETURNED // fully returned
  CANCELLED
}

model Item {
  id             String   @id @default(cuid())
  name           String
  unit           String   // "pcs" etc.
  totalQuantity  Int      // authoritative stock count
  minQuantity    Int      @default(0) // low-stock threshold (optional UI)
  notes          String?  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  rentalItems    RentalItem[]
}

model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  email     String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  rentals   Rental[]
}

model Rental {
  id          String        @id @default(cuid())
  customerId  String
  startDate   DateTime      // store date at 00:00Z
  endDate     DateTime      // inclusive range
  status      RentalStatus  @default(CONFIRMED)
  reference   String?       // human-friendly code (e.g., RNT-000123)
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  customer    Customer      @relation(fields: [customerId], references: [id])
  items       RentalItem[]

  @@index([startDate])
  @@index([endDate])
  @@index([status])
}

model RentalItem {
  id        String  @id @default(cuid())
  rentalId  String
  itemId    String
  quantity  Int

  rental    Rental  @relation(fields: [rentalId], references: [id])
  item      Item    @relation(fields: [itemId], references: [id])

  @@index([itemId])
  @@unique([rentalId, itemId])
}
```

---

## 5) Availability Queries

**Check conflicts when creating/editing a rental** (pseudo‑SQL):

```sql
-- Given: $item_id, $qty, $start, $end (inclusive), and optional $rental_id for edits
SELECT i.total_quantity - COALESCE(SUM(ri.quantity), 0) AS remaining
FROM item i
LEFT JOIN rental_item ri ON ri.item_id = i.id
LEFT JOIN rental r ON r.id = ri.rental_id
  AND r.status IN ('CONFIRMED','OUT')
  AND r.start_date <= $end
  AND r.end_date >= $start
  AND (r.id <> $rental_id OR $rental_id IS NULL)
WHERE i.id = $item_id
GROUP BY i.id;
```

If `remaining < requestedQty` **for any day** in the date range, block and show the conflict. For precise per‑day checks, use a generated series over dates and aggregate by day:

```sql
WITH days AS (
  SELECT generate_series($start::date, $end::date, '1 day') AS d
)
SELECT d.d AS day,
       i.total_quantity - COALESCE(SUM(ri.quantity),0) AS remaining
FROM days d
CROSS JOIN item i
LEFT JOIN rental_item ri ON ri.item_id = i.id
LEFT JOIN rental r ON r.id = ri.rental_id
  AND r.status IN ('CONFIRMED','OUT')
  AND r.start_date::date <= d.d
  AND r.end_date::date   >= d.d
WHERE i.id = $item_id
GROUP BY d.d, i.total_quantity
ORDER BY d.d;
```

Use this for calendar badge counts and to warn on specific conflict days.

---

## 6) API Design (Next.js App Router — `app/api/*`)

* `POST /api/items` — create item `{name, unit, totalQuantity, minQuantity?, notes?}`

* `GET /api/items` — list items (with computed **remaining today** if `?date=YYYY-MM-DD`)

* `GET /api/items/[id]` — item detail (with sparkline availability `?start&end`)

* `PATCH /api/items/[id]` — update item

* `DELETE /api/items/[id]`

* `POST /api/customers` — create customer `{name, phone?, email?, notes?}`

* `GET /api/customers` / `GET /api/customers/[id]`

* `POST /api/rentals` — create rental `{customerId, startDate, endDate, items: [{itemId, quantity}]}` with conflict check

* `GET /api/rentals?start=…&end=…` — rentals overlapping period (for calendar)

* `GET /api/rentals/[id]` — rental detail

* `PATCH /api/rentals/[id]` — edit (re‑validate conflicts)

* `PATCH /api/rentals/[id]/status` — update status (DRAFT→CONFIRMED, OUT, RETURNED, CANCELLED)

* `DELETE /api/rentals/[id]`

* `GET /api/availability?start=…&end=…&itemId=…` — per‑day remaining counts

All handlers use Zod for input parsing, return JSON. Prisma for DB access.

---

## 7) UI/UX

**Pages**

* **Home (`/`)**

  * Header KPIs: Total Items, Items Out Today, Due Back Today, Low‑Stock Alerts.
  * **Calendar** (FullCalendar): Month (default) + Week + Day tabs.
  * Event color badges show **rental quantity** (e.g., “Tables ×4”).
  * Click a date → right‑side **Drawer** with:

    * Rentals on that day (cards): renter, items with quantities, status, due back date.
    * **Per‑Item remaining** table for that day (Item | Total | Reserved | Remaining).
    * Quick actions: Create Rental on this date, Mark Returned.

* **Items (`/items`)**

  * Table of items with search + inline edit for `totalQuantity`.
  * Each row shows **Remaining Today** and a mini availability timeline (sparkline) for next 30 days.

* **Rentals (`/rentals`)**

  * List of rentals with status chips and date range.
  * New Rental button → **Rental Wizard**:

    1. Pick customer (or create new)
    2. Pick date range
    3. Add items + quantities (live availability checker)
    4. Review & confirm (conflict warnings inline per day)

* **Customers (`/customers`)**

  * Simple CRM: contact info + past/future rentals.

**Components**

* `Calendar` (FullCalendar wrapper) — resource/time grid disabled; dayGridMonth/week/day.
* `DayDrawer` — shows day detail.
* `ItemAvailabilityBar` — per‑item sparkline (SVG) for availability over next N days.
* `RentalWizard` — 3–4 step wizard with Zod + React Hook Form.

**Design**

* Tailwind + Radix for dialogs/drawers.
* Mobile: Calendar switches to list for days; Drawer becomes full‑screen sheet.

---

## 8) Conflict Prevention Logic (Server)

On `POST /api/rentals` and `PATCH /api/rentals/[id]`:

1. Normalize dates to **00:00 UTC**; treat end date as **inclusive**.
2. For each line item, run the **per‑day availability query** (see §5).
3. If any `remaining < requestedQty` on any day, respond `409 CONFLICT` with specific days and deficits.
4. Otherwise, commit: upsert rental + `RentalItem` rows within a DB transaction.

Additionally on **status changes**:

* `OUT` marks rental as currently taken (still counts toward reserved).
* `RETURNED` stops contributing after `endDate`; you may optionally allow early returns (toggle: if returned early, endDate set to return day, or separate return table — MVP skip).

---

## 9) Repository Structure

```
rental-inventory/
├─ app/
│  ├─ (marketing)/page.tsx            # optional landing
│  ├─ page.tsx                         # Home: KPIs + Calendar + DayDrawer
│  ├─ items/page.tsx                   # Items list
│  ├─ rentals/page.tsx                 # Rentals list
│  ├─ customers/page.tsx               # Customers list
│  ├─ api/
│  │  ├─ items/route.ts                # GET/POST
│  │  ├─ items/[id]/route.ts           # GET/PATCH/DELETE
│  │  ├─ customers/route.ts
│  │  ├─ customers/[id]/route.ts
│  │  ├─ rentals/route.ts
│  │  ├─ rentals/[id]/route.ts
│  │  ├─ rentals/[id]/status/route.ts
│  │  └─ availability/route.ts
│  ├─ components/
│  │  ├─ Calendar.tsx
│  │  ├─ DayDrawer.tsx
│  │  ├─ ItemAvailabilityBar.tsx
│  │  ├─ RentalWizard/
│  │  │  ├─ StepDates.tsx
│  │  │  ├─ StepCustomer.tsx
│  │  │  ├─ StepItems.tsx
│  │  │  └─ Review.tsx
│  │  └─ ui/* (dialog, drawer, button, input)
│  └─ lib/
│     ├─ prisma.ts                     # Prisma client singleton
│     ├─ dates.ts                      # UTC helpers
│     └─ validation.ts                 # Zod schemas
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ tests/
│  ├─ e2e/
│  └─ unit/
├─ public/
├─ .env.example
├─ package.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ tsconfig.json
└─ README.md
```

---

## 10) Implementation Steps (copy‑paste runnable)

1. **Scaffold**

```bash
pnpm create next-app@latest rental-inventory --ts --eslint --tailwind --app --src-dir=false --import-alias "@/*"
cd rental-inventory
pnpm add @prisma/client prisma zod date-fns @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
pnpm add -D @types/node vitest playwright @playwright/test ts-node prisma-debug
```

2. **Database (Neon)**

* Create Neon project → copy `DATABASE_URL`.
* Create `.env` from `.env.example`:

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="dev-secret" # if using auth later
```

3. **Prisma init + migrate + seed**

```bash
pnpm prisma init
# replace prisma/schema.prisma with the schema above
pnpm prisma migrate dev --name init
pnpm exec ts-node prisma/seed.ts
```

**`prisma/seed.ts` (example)**

```ts
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const items = [
    { name: "Table 6ft", unit: "pcs", totalQuantity: 10 },
    { name: "Chair (white)", unit: "pcs", totalQuantity: 100 },
    { name: "Canopy 10x10", unit: "pcs", totalQuantity: 5 },
    { name: "Plate", unit: "pcs", totalQuantity: 200 },
    { name: "Fork", unit: "pcs", totalQuantity: 200 },
    { name: "Spoon", unit: "pcs", totalQuantity: 200 },
  ];
  await p.item.createMany({ data: items });

  const customer = await p.customer.create({ data: { name: "Jane Doe", phone: "555-1234", email: "jane@example.com" } });

  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 3);

  const rental = await p.rental.create({
    data: {
      customerId: customer.id,
      startDate: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())),
      endDate: new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())),
      status: "CONFIRMED",
      items: {
        create: [
          { quantity: 4, item: { connect: { name: "Table 6ft" } } },
          { quantity: 20, item: { connect: { name: "Chair (white)" } } },
        ],
      },
    },
  });

  console.log({ rental });
}

main().finally(() => p.$disconnect());
```

4. **Calendar Component (sketch)**

```tsx
// app/components/Calendar.tsx
"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function Calendar({ events, onDateClick }: { events: any[]; onDateClick: (d: Date) => void }) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      dateClick={(info) => onDateClick(info.date)}
      eventDisplay="block"
      height="auto"
    />
  );
}
```

5. **Calendar Events API**

* Feed FullCalendar with `GET /api/rentals?start=…&end=…` returning:

```json
[
  {
    "id": "rentalId",
    "title": "Jane Doe — Tables ×4, Chairs ×20",
    "start": "2025-11-05",
    "end": "2025-11-09" // FullCalendar end is exclusive; add +1 day when serializing
  }
]
```

6. **Day Drawer API**

* `GET /api/day?date=YYYY-MM-DD` returns:

  * Rentals on that date (with items, quantities, customer)
  * Per‑item (Total, Reserved, Remaining) for that date

7. **Availability Helper** (`lib/dates.ts`)

* Utilities to: normalize to 00:00 UTC; add one day; overlap checks.

8. **Rental Wizard**

* Live query `/api/availability?start&end&itemId` when changing qty.
* Disable submit if any conflict days return `< requestedQty`.

9. **Deployment**

* Push to GitHub.
* Import to Vercel, set env vars.
* Vercel build command: `pnpm install && pnpm prisma generate && pnpm build`.

---

## 11) Edge Cases & Rules

* **Inclusive end date**: store days as UTC 00:00; when serializing for FullCalendar, set `end = endDate + 1 day`.
* **Partial overlaps**: rentals that start before the month and end inside it still appear correctly.
* **Quantity edits**: on rental edit, exclude the current rental from conflict joins via `r.id <> $rental_id`.
* **Low stock alerts**: if `remaining(today) < minQuantity`, show warning chip on `/items` and `/`.
* **Timezones**: input dates as local, convert to UTC midnight. Display in user’s tz.
* **Returns**: MVP assumes returns happen on `endDate`. Future: early return button to adjust `endDate` to today.

---

## 12) Testing Plan

* **Unit (Vitest):**

  * Availability calculator for overlapping windows.
  * Date helpers and inclusive end logic.
* **API Tests:**

  * Create rental success vs conflict (409) paths.
  * Editing rental quantities with exclusion of self.
* **E2E (Playwright):**

  * Create item → create rental → see event on calendar → open day drawer → verify remaining counts.

---

## 13) Nice‑to‑Haves (post‑MVP)

* Barcode/QR for items; scan on OUT/RETURN events.
* CSV export for rentals and inventory.
* Email/SMS reminders for upcoming returns.
* Roles/permissions; multi‑location support.
* Printable pick lists & contracts.
* Stripe for deposits.

---

## 14) Prompts for Claude SDK (tasking the agent)

**Scaffold & DB**

> Create a Next.js 15 (App Router, TS, Tailwind) project named `rental-inventory`. Add Prisma + PostgreSQL (Neon) with the exact schema from §4. Provide migration and a `prisma/seed.ts` that inserts sample items and a sample rental.

**API & Calendar**

> Implement the API routes from §6 using Zod for input validation and Prisma for DB calls. Build a `Calendar` component (FullCalendar) on `/` that loads events from `GET /api/rentals?start&end` and a `DayDrawer` fed by `GET /api/day?date`.

**Availability & Wizard**

> Code the per‑day availability queries from §5. In the Rental Wizard, validate conflicts live; on submit, block and render a per‑day deficit table for any item with insufficient stock.

**Deployment**

> Prepare `.env.example`, Prisma client singleton, and add build scripts so Vercel deploys cleanly. Document all commands in README.

---

## 15) Commands Cheat‑Sheet

```bash
# Dev
pnpm dev

# Prisma
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm exec ts-node prisma/seed.ts

# Tests
pnpm test
pnpm exec playwright install && pnpm exec playwright test
```

---

## 16) README Notes (to include later)

* How to invite team members on Neon.
* How to rotate `DATABASE_URL` safely.
* How to add authentication if needed (NextAuth, Credentials provider).

---

## 17) Minimal ER Diagram (ASCII)

```
[Item] 1──< [RentalItem] >──1 [Rental] 1───* [Customer]
  | totalQuantity                 | quantity         | startDate..endDate
```

This plan is implementation‑ready, uses best‑in‑class free tools, and gives Claude concrete tasks + files to generate. Good to ship.

