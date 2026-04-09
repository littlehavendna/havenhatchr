ALTER TABLE "ShowEntry"
ADD COLUMN "entryType" TEXT NOT NULL DEFAULT 'Poultry',
ADD COLUMN "species" TEXT NOT NULL DEFAULT 'Chicken',
ADD COLUMN "sizeClass" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sexClass" TEXT NOT NULL DEFAULT '',
ADD COLUMN "ageClass" TEXT NOT NULL DEFAULT '',
ADD COLUMN "breed" TEXT NOT NULL DEFAULT '',
ADD COLUMN "variety" TEXT NOT NULL DEFAULT '',
ADD COLUMN "division" TEXT NOT NULL DEFAULT '',
ADD COLUMN "specialEntryType" TEXT NOT NULL DEFAULT '',
ADD COLUMN "showString" TEXT NOT NULL DEFAULT '',
ADD COLUMN "pointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "judgeName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "judgeNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN "judgeComments" TEXT NOT NULL DEFAULT '',
ADD COLUMN "customAwardText" TEXT NOT NULL DEFAULT '',
ADD COLUMN "numberInClass" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "numberOfExhibitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "bestOfBreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reserveOfBreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestOfVariety" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reserveOfVariety" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestAmerican" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestAsiatic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestMediterranean" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestContinental" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestEnglish" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestGame" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestAllOtherStandardBreeds" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestBantam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bestInShow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reserveInShow" BOOLEAN NOT NULL DEFAULT false;

UPDATE "ShowEntry"
SET
  "entryType" = 'Poultry',
  "species" = 'Chicken',
  "showString" = CASE
    WHEN COALESCE("entryClass", '') <> '' THEN "entryClass"
    ELSE 'Poultry Entry'
  END,
  "judgeComments" = "judgeNotes";

ALTER TABLE "ShowEntry" DROP COLUMN "judgeNotes";

CREATE INDEX "ShowEntry_species_idx" ON "ShowEntry"("species");
CREATE INDEX "ShowEntry_breed_idx" ON "ShowEntry"("breed");
CREATE INDEX "ShowEntry_variety_idx" ON "ShowEntry"("variety");
