-- DropIndex
DROP INDEX "public"."Bird_bandNumber_key";

-- DropIndex
DROP INDEX "public"."Chick_bandNumber_key";

-- DropIndex
DROP INDEX "public"."Trait_name_key";

-- AlterTable
ALTER TABLE "Bird" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Chick" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Flock" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HatchGroup" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pairing" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trait" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT NOT NULL,
ALTER COLUMN "plan" SET DEFAULT 'Starter';

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Bird_userId_idx" ON "Bird"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bird_userId_bandNumber_key" ON "Bird"("userId", "bandNumber");

-- CreateIndex
CREATE INDEX "Chick_userId_idx" ON "Chick"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Chick_userId_bandNumber_key" ON "Chick"("userId", "bandNumber");

-- CreateIndex
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Flock_userId_idx" ON "Flock"("userId");

-- CreateIndex
CREATE INDEX "HatchGroup_userId_idx" ON "HatchGroup"("userId");

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "Note"("userId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Pairing_userId_idx" ON "Pairing"("userId");

-- CreateIndex
CREATE INDEX "Photo_userId_idx" ON "Photo"("userId");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Trait_userId_idx" ON "Trait"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Trait_userId_name_key" ON "Trait"("userId", "name");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flock" ADD CONSTRAINT "Flock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bird" ADD CONSTRAINT "Bird_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pairing" ADD CONSTRAINT "Pairing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HatchGroup" ADD CONSTRAINT "HatchGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chick" ADD CONSTRAINT "Chick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trait" ADD CONSTRAINT "Trait_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
