# 🚨 CRITICAL: User Data Isolation Migration Plan

## What Changed

Your database schema has been updated to implement **proper user data isolation**. This is a **CRITICAL SECURITY FIX** that prevents users from seeing each other's data.

### Before (INSECURE):
- All users saw ALL items, customers, bookings
- No data privacy or isolation
- Security vulnerability

### After (SECURE):
- Each user only sees their own data
- Complete data isolation
- Admin can see all data (with special API routes)

---

## ⚠️ IMPORTANT: You Have Existing Data

Since you already have data in production, we need a careful migration strategy.

---

## Step-by-Step Migration Process

### Step 1: Get Your Admin User ID

First, find your admin account's user ID:

```bash
# Option A: Using Prisma Studio
npx prisma studio
# Open browser → Click "User" → Find your admin email → Copy the "id" field

# Option B: Using psql/database console
# Run this query in your database:
SELECT id, email FROM "User" WHERE email = 'your-admin-email@example.com';
```

**Copy this ID** - you'll need it for Step 3.

---

### Step 2: Create Custom Migration

We need to create a migration that:
1. Adds `userId` columns (nullable first)
2. Assigns all existing data to your admin account
3. Makes `userId` non-nullable

**Run this locally:**

```bash
# Create the migration
npx prisma migrate dev --create-only --name add_user_isolation
```

This creates a migration file without applying it.

---

### Step 3: Edit the Migration File

Navigate to: `prisma/migrations/[timestamp]_add_user_isolation/migration.sql`

**Replace the contents with this** (update `YOUR_ADMIN_USER_ID`):

```sql
-- Add userId columns as nullable first
ALTER TABLE "Item" ADD COLUMN "userId" TEXT;
ALTER TABLE "Customer" ADD COLUMN "userId" TEXT;
ALTER TABLE "Rental" ADD COLUMN "userId" TEXT;  -- Rental is the database name for Booking
ALTER TABLE "Settings" ADD COLUMN "userId" TEXT;

-- Assign ALL existing data to the admin user
-- REPLACE 'YOUR_ADMIN_USER_ID' with your actual admin ID from Step 1
UPDATE "Item" SET "userId" = 'YOUR_ADMIN_USER_ID' WHERE "userId" IS NULL;
UPDATE "Customer" SET "userId" = 'YOUR_ADMIN_USER_ID' WHERE "userId" IS NULL;
UPDATE "Rental" SET "userId" = 'YOUR_ADMIN_USER_ID' WHERE "userId" IS NULL;
UPDATE "Settings" SET "userId" = 'YOUR_ADMIN_USER_ID' WHERE "userId" IS NULL;

-- Make userId NOT NULL
ALTER TABLE "Item" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Rental" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Settings" ALTER COLUMN "userId" SET NOT NULL;

-- Create foreign key constraints
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Rental" ADD CONSTRAINT "Rental_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Update unique constraints
-- Drop old constraints
ALTER TABLE "Item" DROP CONSTRAINT IF EXISTS "unique_item_name";
ALTER TABLE "Customer" DROP CONSTRAINT IF EXISTS "unique_customer_email";
ALTER TABLE "Rental" DROP CONSTRAINT IF EXISTS "unique_booking_reference";

-- Create new user-scoped unique constraints
CREATE UNIQUE INDEX "unique_user_item_name" ON "Item"("userId", "name");
CREATE UNIQUE INDEX "unique_user_customer_email" ON "Customer"("userId", "email");
CREATE UNIQUE INDEX "unique_user_booking_reference" ON "Rental"("userId", "reference");
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- Create indexes for performance
CREATE INDEX "Item_userId_idx" ON "Item"("userId");
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");
CREATE INDEX "Rental_userId_idx" ON "Rental"("userId");
CREATE INDEX "Settings_userId_idx" ON "Settings"("userId");
```

---

### Step 4: Apply Migration Locally

```bash
npx prisma migrate dev
```

This will apply the migration to your local database.

---

### Step 5: Test Locally

1. Sign in as admin
2. You should see all your existing data
3. Create a new test user account
4. Sign in as test user - should see NO data (clean slate)
5. Create some test items/bookings as test user
6. Switch back to admin - should still see your original data + admin's own data

---

### Step 6: Deploy to Production

```bash
# Commit migration
git add prisma/migrations/
git commit -m "Add user data isolation migration"
git push

# Wait for Vercel to deploy

# Run migration on production database
npx prisma migrate deploy
```

---

## Password Security Verification

Your passwords are **already secure**:

✅ **Bcrypt hashing** with 12 salt rounds (industry standard)
✅ **Never stored in plain text**
✅ **One-way encryption** (cannot be reversed)
✅ **Secure comparison** to prevent timing attacks

See: `app/lib/auth.ts` lines 5-19 for implementation.

**Additional Security Implemented:**
- HTTP-only cookies (prevents XSS)
- CSRF protection via NextAuth
- Rate limiting on authentication endpoints
- Input sanitization
- Secure session management (30-day JWT expiry)

---

## Next Steps: Update API Routes

After migration, **ALL API routes** must be updated to filter by `userId`. This is in progress.

### Example Pattern:

**Before (INSECURE):**
```typescript
const items = await prisma.item.findMany();
```

**After (SECURE):**
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const items = await prisma.item.findMany({
  where: { userId: session.user.id }
});
```

---

## Admin Dashboard

A separate admin dashboard will be created at `/admin` that:
- Shows ALL users and their data
- Requires `role = 'admin'` to access
- Provides analytics and management tools
- Is properly authenticated and authorized

---

## Questions?

If you encounter any issues during migration:
1. **DON'T PANIC** - we can roll back
2. Check error messages carefully
3. Verify your admin user ID is correct
4. Make sure you replaced `YOUR_ADMIN_USER_ID` in the SQL

---

## Rollback Plan

If something goes wrong:

```bash
# Locally
npx prisma migrate reset

# Production (CAREFUL!)
# Contact your database provider to restore from backup
```

**Always test locally first before deploying to production!**
