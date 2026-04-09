ALTER TABLE "HatchGroup" DROP CONSTRAINT "HatchGroup_pairingId_fkey";

ALTER TABLE "HatchGroup"
ALTER COLUMN "pairingId" DROP NOT NULL;

ALTER TABLE "HatchGroup"
ADD CONSTRAINT "HatchGroup_pairingId_fkey"
FOREIGN KEY ("pairingId") REFERENCES "Pairing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
