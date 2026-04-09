ALTER TABLE "Show"
ADD COLUMN "standardsProfile" TEXT NOT NULL DEFAULT 'Open Poultry',
ADD COLUMN "awardTemplateName" TEXT NOT NULL DEFAULT 'Default Poultry Awards',
ADD COLUMN "specialShowDivision" TEXT NOT NULL DEFAULT '';

ALTER TABLE "ShowEntry"
ADD COLUMN "apaClass" TEXT NOT NULL DEFAULT '',
ADD COLUMN "varietyClassification" TEXT NOT NULL DEFAULT '',
ADD COLUMN "specialShowDivision" TEXT NOT NULL DEFAULT '',
ADD COLUMN "awardTemplateKey" TEXT NOT NULL DEFAULT '',
ADD COLUMN "breedClubAward" TEXT NOT NULL DEFAULT '';
