-- CreateEnum
CREATE TYPE "DnaTestStatus" AS ENUM ('Pending', 'Completed', 'Cancelled');

-- CreateTable
CREATE TABLE "DnaTestRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chickId" TEXT NOT NULL,
    "bandNumber" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "status" "DnaTestStatus" NOT NULL DEFAULT 'Pending',
    "externalOrderId" TEXT DEFAULT '',
    "resultSummary" TEXT DEFAULT '',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DnaTestRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DnaTestRequest_userId_idx" ON "DnaTestRequest"("userId");

-- CreateIndex
CREATE INDEX "DnaTestRequest_chickId_idx" ON "DnaTestRequest"("chickId");

-- CreateIndex
CREATE INDEX "DnaTestRequest_status_idx" ON "DnaTestRequest"("status");

-- AddForeignKey
ALTER TABLE "DnaTestRequest" ADD CONSTRAINT "DnaTestRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DnaTestRequest" ADD CONSTRAINT "DnaTestRequest_chickId_fkey" FOREIGN KEY ("chickId") REFERENCES "Chick"("id") ON DELETE CASCADE ON UPDATE CASCADE;
