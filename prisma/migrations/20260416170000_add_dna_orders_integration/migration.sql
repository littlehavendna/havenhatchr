-- CreateEnum
CREATE TYPE "DnaTestOrderStatus" AS ENUM ('PendingPayment', 'Paid', 'Synced', 'Completed', 'Cancelled', 'SyncFailed');

-- CreateTable
CREATE TABLE "DnaTestOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "selectedTests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalAmountCents" INTEGER NOT NULL DEFAULT 0,
    "status" "DnaTestOrderStatus" NOT NULL DEFAULT 'PendingPayment',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "externalOrderId" TEXT DEFAULT '',
    "externalOrderCode" TEXT DEFAULT '',
    "externalCustomerId" TEXT DEFAULT '',
    "syncError" TEXT DEFAULT '',
    "syncedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DnaTestOrder_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "DnaTestRequest"
ADD COLUMN     "dnaTestOrderId" TEXT,
ADD COLUMN     "sampleNumber" INTEGER,
ADD COLUMN     "selectedTests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "externalSampleId" TEXT DEFAULT '',
ADD COLUMN     "resultPayload" JSONB;

-- CreateIndex
CREATE INDEX "DnaTestOrder_userId_idx" ON "DnaTestOrder"("userId");

-- CreateIndex
CREATE INDEX "DnaTestOrder_status_idx" ON "DnaTestOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DnaTestOrder_stripeCheckoutSessionId_key" ON "DnaTestOrder"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "DnaTestOrder_stripePaymentIntentId_key" ON "DnaTestOrder"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "DnaTestRequest_dnaTestOrderId_idx" ON "DnaTestRequest"("dnaTestOrderId");

-- AddForeignKey
ALTER TABLE "DnaTestOrder" ADD CONSTRAINT "DnaTestOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DnaTestRequest" ADD CONSTRAINT "DnaTestRequest_dnaTestOrderId_fkey" FOREIGN KEY ("dnaTestOrderId") REFERENCES "DnaTestOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
