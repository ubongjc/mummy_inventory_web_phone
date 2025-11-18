-- AlterTable
ALTER TABLE "User" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "ownerId" TEXT,
ALTER COLUMN "role" SET DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "plan",
ADD COLUMN IF NOT EXISTS "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

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

-- Update existing NULL values for currentPeriodStart and currentPeriodEnd
UPDATE "Subscription"
SET "currentPeriodStart" = COALESCE("currentPeriodStart", NOW()),
    "currentPeriodEnd" = COALESCE("currentPeriodEnd", NOW() + INTERVAL '30 days')
WHERE "currentPeriodStart" IS NULL OR "currentPeriodEnd" IS NULL;

-- Make currentPeriodStart and currentPeriodEnd required
ALTER TABLE "Subscription"
ALTER COLUMN "currentPeriodStart" SET NOT NULL,
ALTER COLUMN "currentPeriodEnd" SET NOT NULL;

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
