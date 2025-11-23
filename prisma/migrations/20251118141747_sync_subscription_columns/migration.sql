-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "currentPeriodEnd" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "currentPeriodStart";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "cancelAtPeriodEnd";
