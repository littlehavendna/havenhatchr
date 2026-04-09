-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "birdId" TEXT,
ADD COLUMN     "chickId" TEXT,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "flockId" TEXT,
ADD COLUMN     "hatchGroupId" TEXT,
ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "pairingId" TEXT,
ADD COLUMN     "reservationId" TEXT;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "birdId" TEXT,
ADD COLUMN     "chickId" TEXT,
ADD COLUMN     "flockId" TEXT,
ADD COLUMN     "hatchGroupId" TEXT,
ADD COLUMN     "pairingId" TEXT;

-- CreateIndex
CREATE INDEX "Note_birdId_idx" ON "Note"("birdId");

-- CreateIndex
CREATE INDEX "Note_chickId_idx" ON "Note"("chickId");

-- CreateIndex
CREATE INDEX "Note_pairingId_idx" ON "Note"("pairingId");

-- CreateIndex
CREATE INDEX "Note_hatchGroupId_idx" ON "Note"("hatchGroupId");

-- CreateIndex
CREATE INDEX "Note_flockId_idx" ON "Note"("flockId");

-- CreateIndex
CREATE INDEX "Note_customerId_idx" ON "Note"("customerId");

-- CreateIndex
CREATE INDEX "Note_orderId_idx" ON "Note"("orderId");

-- CreateIndex
CREATE INDEX "Note_reservationId_idx" ON "Note"("reservationId");

-- CreateIndex
CREATE INDEX "Photo_birdId_idx" ON "Photo"("birdId");

-- CreateIndex
CREATE INDEX "Photo_chickId_idx" ON "Photo"("chickId");

-- CreateIndex
CREATE INDEX "Photo_pairingId_idx" ON "Photo"("pairingId");

-- CreateIndex
CREATE INDEX "Photo_hatchGroupId_idx" ON "Photo"("hatchGroupId");

-- CreateIndex
CREATE INDEX "Photo_flockId_idx" ON "Photo"("flockId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_birdId_fkey" FOREIGN KEY ("birdId") REFERENCES "Bird"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_chickId_fkey" FOREIGN KEY ("chickId") REFERENCES "Chick"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_pairingId_fkey" FOREIGN KEY ("pairingId") REFERENCES "Pairing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_hatchGroupId_fkey" FOREIGN KEY ("hatchGroupId") REFERENCES "HatchGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_birdId_fkey" FOREIGN KEY ("birdId") REFERENCES "Bird"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_chickId_fkey" FOREIGN KEY ("chickId") REFERENCES "Chick"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_pairingId_fkey" FOREIGN KEY ("pairingId") REFERENCES "Pairing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_hatchGroupId_fkey" FOREIGN KEY ("hatchGroupId") REFERENCES "HatchGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
