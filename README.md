# Rental Inventory Management System

A modern web application for tracking rental inventory with a beautiful calendar interface. Built with Next.js 15, PostgreSQL, and FullCalendar.

## Features

- **Visual Calendar Interface**: Month, week, and day views for easy navigation
- **Rental Management**: Track active rentals, customer information, and due dates
- **Real-time Availability**: See item availability for any date
- **Conflict Prevention**: System warns when trying to overbook items
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, FullCalendar, Lucide Icons
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud like Neon, Supabase)

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up your database**

Update the `.env` file with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rental_inventory?schema=public"
```

For a free cloud database, you can use:
- **Neon**: https://neon.tech (recommended for free tier)
- **Supabase**: https://supabase.com

3. **Run database migrations**

```bash
npx prisma migrate dev --name init
```

4. **Seed the database with sample data**

```bash
npx ts-node prisma/seed.ts
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Calendar Interface

- **Click on any date** to view rentals and availability for that day
- **Navigate** using the prev/next buttons or select different views (Month/Week/Day)
- **Color coding**:
  - Blue: Confirmed rentals
  - Red: Items currently out (picked up)

### Managing Data

The application provides API endpoints for managing:

- **Items** (`/api/items`): Create and manage inventory items
- **Customers** (`/api/customers`): Manage customer information
- **Rentals** (`/api/rentals`): Create and track rentals
- **Availability** (`/api/day?date=YYYY-MM-DD`): Check availability for specific dates

### Database Schema

The system uses four main models:

- **Item**: Inventory items (tables, chairs, etc.) with total quantity
- **Customer**: Customer contact information
- **Rental**: Bookings with start/end dates and status
- **RentalItem**: Line items linking rentals to specific items and quantities

## Development

### Project Structure

```
rental-inventory/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── lib/             # Utilities (Prisma, validation, dates)
│   ├── styles/          # Global CSS
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page with calendar
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio to view/edit data
- `npx prisma migrate dev` - Create and apply migrations
- `npx ts-node prisma/seed.ts` - Run seed script

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your `DATABASE_URL` environment variable
4. Deploy!

Vercel will automatically:
- Install dependencies
- Generate Prisma Client
- Build the Next.js application

### Database Setup

Before deploying, make sure to:
1. Create a production database (Neon, Supabase, etc.)
2. Run migrations: `npx prisma migrate deploy`
3. Optionally seed with data: `npx ts-node prisma/seed.ts`

## Customization

### Adding New Item Types

Edit `prisma/seed.ts` to add your own inventory items:

```typescript
await prisma.item.create({
  data: {
    name: "Your Item Name",
    unit: "pcs",
    totalQuantity: 50,
    minQuantity: 5,
  },
});
```

### Modifying the Calendar

The calendar component is located at `app/components/Calendar.tsx`. You can customize:
- Initial view (month/week/day)
- Colors and styling
- Event display format
- Header toolbar options

## Troubleshooting

### Database Connection Issues

If you see connection errors:
1. Check your `DATABASE_URL` in `.env`
2. Ensure PostgreSQL is running (if local)
3. Verify your database credentials

### Prisma Client Errors

If Prisma Client is not found:
```bash
npx prisma generate
```

### Clear and Reset Database

To start fresh:
```bash
npx prisma migrate reset
npx ts-node prisma/seed.ts
```

## Future Enhancements

- Email/SMS notifications for upcoming returns
- Barcode scanning for item tracking
- CSV export for reports
- Multi-location support
- Payment integration
- Printable pick lists and contracts

## License

MIT

## Support

For issues or questions, please check the documentation at:
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [FullCalendar Docs](https://fullcalendar.io/docs)
# mummy_inventory_web_phone
