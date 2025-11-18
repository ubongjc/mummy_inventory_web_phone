-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "ownerId" TEXT,
ALTER COLUMN "role" SET DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "plan",
ADD COLUMN IF NOT EXISTS "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'inactive';

-- Rename stripeSubId to stripeSubscriptionId if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Subscription'
    AND column_name = 'stripeSubId'
  ) THEN
    ALTER TABLE "Subscription" RENAME COLUMN "stripeSubId" TO "stripeSubscriptionId";
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_ownerId_idx" ON "User"("ownerId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'User_ownerId_fkey'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
