ALTER TABLE "HatchGroup"
ADD COLUMN "breedDesignation" TEXT NOT NULL DEFAULT 'Chicken',
ADD COLUMN "lockdownDate" TIMESTAMP(3);

UPDATE "HatchGroup"
SET "lockdownDate" = "hatchDate" - INTERVAL '3 days'
WHERE "lockdownDate" IS NULL;

ALTER TABLE "HatchGroup"
ALTER COLUMN "lockdownDate" SET NOT NULL;
