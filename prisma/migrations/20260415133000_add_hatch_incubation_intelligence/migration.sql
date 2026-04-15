-- AlterEnum
ALTER TYPE "ChickStatus" ADD VALUE 'Deceased';

-- CreateEnum
CREATE TYPE "ChickDeathReason" AS ENUM (
    'FailureToThrive',
    'ShippedWeak',
    'SplayLeg',
    'Injury',
    'Predator',
    'UnabsorbedYolk',
    'AssistedHatchComplications',
    'Unknown',
    'Other'
);

-- AlterTable
ALTER TABLE "Chick"
ADD COLUMN "damId" TEXT,
ADD COLUMN "sireId" TEXT;

-- CreateTable
CREATE TABLE "Incubator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT '',
    "model" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incubator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncubatorRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "incubatorId" TEXT NOT NULL,
    "hatchGroupId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "lockdownDate" TIMESTAMP(3) NOT NULL,
    "expectedHatchDate" TIMESTAMP(3) NOT NULL,
    "temperatureNotes" TEXT NOT NULL DEFAULT '',
    "humidityNotes" TEXT NOT NULL DEFAULT '',
    "turningNotes" TEXT NOT NULL DEFAULT '',
    "lockdownHumidityNotes" TEXT NOT NULL DEFAULT '',
    "specialAdjustments" TEXT NOT NULL DEFAULT '',
    "generalNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncubatorRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChickDeathRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chickId" TEXT NOT NULL,
    "deathDate" TIMESTAMP(3) NOT NULL,
    "deathReason" "ChickDeathReason" NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChickDeathRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chick_sireId_idx" ON "Chick"("sireId");

-- CreateIndex
CREATE INDEX "Chick_damId_idx" ON "Chick"("damId");

-- CreateIndex
CREATE INDEX "Incubator_userId_idx" ON "Incubator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Incubator_userId_name_key" ON "Incubator"("userId", "name");

-- CreateIndex
CREATE INDEX "IncubatorRun_userId_idx" ON "IncubatorRun"("userId");

-- CreateIndex
CREATE INDEX "IncubatorRun_incubatorId_idx" ON "IncubatorRun"("incubatorId");

-- CreateIndex
CREATE INDEX "IncubatorRun_hatchGroupId_idx" ON "IncubatorRun"("hatchGroupId");

-- CreateIndex
CREATE INDEX "IncubatorRun_startDate_idx" ON "IncubatorRun"("startDate");

-- CreateIndex
CREATE INDEX "ChickDeathRecord_userId_idx" ON "ChickDeathRecord"("userId");

-- CreateIndex
CREATE INDEX "ChickDeathRecord_chickId_idx" ON "ChickDeathRecord"("chickId");

-- CreateIndex
CREATE INDEX "ChickDeathRecord_deathDate_idx" ON "ChickDeathRecord"("deathDate");

-- CreateIndex
CREATE INDEX "ChickDeathRecord_deathReason_idx" ON "ChickDeathRecord"("deathReason");

-- AddForeignKey
ALTER TABLE "Chick" ADD CONSTRAINT "Chick_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "Bird"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chick" ADD CONSTRAINT "Chick_damId_fkey" FOREIGN KEY ("damId") REFERENCES "Bird"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incubator" ADD CONSTRAINT "Incubator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncubatorRun" ADD CONSTRAINT "IncubatorRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncubatorRun" ADD CONSTRAINT "IncubatorRun_incubatorId_fkey" FOREIGN KEY ("incubatorId") REFERENCES "Incubator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncubatorRun" ADD CONSTRAINT "IncubatorRun_hatchGroupId_fkey" FOREIGN KEY ("hatchGroupId") REFERENCES "HatchGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChickDeathRecord" ADD CONSTRAINT "ChickDeathRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChickDeathRecord" ADD CONSTRAINT "ChickDeathRecord_chickId_fkey" FOREIGN KEY ("chickId") REFERENCES "Chick"("id") ON DELETE CASCADE ON UPDATE CASCADE;
