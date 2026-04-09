-- AlterTable
ALTER TABLE "Bird" ALTER COLUMN "breed" SET DEFAULT '',
ALTER COLUMN "variety" SET DEFAULT '',
ALTER COLUMN "color" SET DEFAULT '',
ALTER COLUMN "genetics" SET DEFAULT '',
ALTER COLUMN "notes" SET DEFAULT '',
ALTER COLUMN "photoUrl" SET DEFAULT '',
ALTER COLUMN "genotypeNotes" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Chick" ALTER COLUMN "color" SET DEFAULT '',
ALTER COLUMN "notes" SET DEFAULT '',
ALTER COLUMN "photoUrl" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" SET DEFAULT '',
ALTER COLUMN "phone" SET DEFAULT '',
ALTER COLUMN "location" SET DEFAULT '',
ALTER COLUMN "notes" SET DEFAULT '',
ALTER COLUMN "status" SET DEFAULT 'Active';

-- AlterTable
ALTER TABLE "Flock" ALTER COLUMN "breed" SET DEFAULT '',
ALTER COLUMN "variety" SET DEFAULT '',
ALTER COLUMN "notes" SET DEFAULT '';

-- AlterTable
ALTER TABLE "HatchGroup" ALTER COLUMN "eggsSet" SET DEFAULT 0,
ALTER COLUMN "eggsHatched" SET DEFAULT 0,
ALTER COLUMN "producedTraitsSummary" SET DEFAULT '',
ALTER COLUMN "notes" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Pairing" ALTER COLUMN "goals" SET DEFAULT '',
ALTER COLUMN "projectGoal" SET DEFAULT '',
ALTER COLUMN "notes" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "requestedSex" SET DEFAULT 'No Preference',
ALTER COLUMN "requestedBreed" SET DEFAULT '',
ALTER COLUMN "requestedVariety" SET DEFAULT '',
ALTER COLUMN "requestedColor" SET DEFAULT '',
ALTER COLUMN "notes" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Trait" ALTER COLUMN "category" SET DEFAULT '',
ALTER COLUMN "description" SET DEFAULT '';

-- CreateTable
CREATE TABLE "OrderChick" (
    "orderId" TEXT NOT NULL,
    "chickId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderChick_pkey" PRIMARY KEY ("orderId","chickId")
);

-- CreateIndex
CREATE INDEX "OrderChick_chickId_idx" ON "OrderChick"("chickId");

-- Migrate existing order chick links from the old array field into the join table
INSERT INTO "OrderChick" ("orderId", "chickId")
SELECT o."id", c."id"
FROM "Order" o
CROSS JOIN LATERAL UNNEST(o."chickIds") AS legacy("chickId")
JOIN "Chick" c ON c."id" = legacy."chickId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "chickIds",
ALTER COLUMN "total" SET DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'Pending',
ALTER COLUMN "notes" SET DEFAULT '';

-- AddForeignKey
ALTER TABLE "OrderChick" ADD CONSTRAINT "OrderChick_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderChick" ADD CONSTRAINT "OrderChick_chickId_fkey" FOREIGN KEY ("chickId") REFERENCES "Chick"("id") ON DELETE CASCADE ON UPDATE CASCADE;

