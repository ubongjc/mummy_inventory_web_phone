-- AlterTable Item - Add userId
ALTER TABLE "Item" ADD COLUMN "userId" TEXT;

-- AlterTable Customer - Add userId
ALTER TABLE "Customer" ADD COLUMN "userId" TEXT;

-- AlterTable Rental (Booking) - Add userId
ALTER TABLE "Rental" ADD COLUMN "userId" TEXT;

-- AlterTable Settings - Add userId
ALTER TABLE "Settings" ADD COLUMN "userId" TEXT;

-- Delete all existing test data (user requested this)
DELETE FROM "Payment";
DELETE FROM "RentalItem";
DELETE FROM "Rental";
DELETE FROM "Customer";
DELETE FROM "Item";
DELETE FROM "Settings";

-- Now make userId NOT NULL
ALTER TABLE "Item" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Rental" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Settings" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Rental" ADD CONSTRAINT "Rental_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old global unique constraints (if they exist)
DROP INDEX IF EXISTS "unique_item_name";
DROP INDEX IF EXISTS "unique_customer_email";
DROP INDEX IF EXISTS "unique_booking_reference";

-- Create new user-scoped unique constraints
CREATE UNIQUE INDEX "unique_user_item_name" ON "Item"("userId", "name");
CREATE UNIQUE INDEX "unique_user_customer_email" ON "Customer"("userId", "email");
CREATE UNIQUE INDEX "unique_user_booking_reference" ON "Rental"("userId", "reference");
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- Create indexes for query performance
CREATE INDEX "Item_userId_idx" ON "Item"("userId");
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");
CREATE INDEX "Rental_userId_idx" ON "Rental"("userId");
CREATE INDEX "Settings_userId_idx" ON "Settings"("userId");
