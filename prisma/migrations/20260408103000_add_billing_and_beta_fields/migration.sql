-- Add Stripe subscription fields and beta-access bypass to User
ALTER TABLE "User"
ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT,
ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
ADD COLUMN "trialEnd" TIMESTAMP(3),
ADD COLUMN "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN "isBetaUser" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "User"
ALTER COLUMN "plan" SET DEFAULT 'starter';

CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
