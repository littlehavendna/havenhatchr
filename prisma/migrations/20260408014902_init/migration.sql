-- CreateEnum
CREATE TYPE "BirdSex" AS ENUM ('Male', 'Female', 'Unknown');

-- CreateEnum
CREATE TYPE "BirdStatus" AS ENUM ('Active', 'Holdback', 'Retired', 'Sold');

-- CreateEnum
CREATE TYPE "ChickStatus" AS ENUM ('Available', 'Reserved', 'Sold', 'Holdback');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('Waiting', 'Matched', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "NoteEntityType" AS ENUM ('bird', 'flock', 'customer', 'pairing', 'hatchGroup', 'chick', 'order', 'reservation');

-- CreateEnum
CREATE TYPE "PhotoEntityType" AS ENUM ('bird', 'chick', 'flock', 'hatchGroup');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bird" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bandNumber" TEXT NOT NULL,
    "sex" "BirdSex" NOT NULL,
    "breed" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "genetics" TEXT NOT NULL,
    "flockId" TEXT NOT NULL,
    "status" "BirdStatus" NOT NULL,
    "notes" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "visualTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "carriedTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "genotypeNotes" TEXT NOT NULL,
    "projectTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bird_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pairing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sireId" TEXT NOT NULL,
    "damId" TEXT NOT NULL,
    "goals" TEXT NOT NULL,
    "targetTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "projectGoal" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pairing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HatchGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pairingId" TEXT NOT NULL,
    "setDate" TIMESTAMP(3) NOT NULL,
    "hatchDate" TIMESTAMP(3) NOT NULL,
    "eggsSet" INTEGER NOT NULL,
    "eggsHatched" INTEGER NOT NULL,
    "producedTraitsSummary" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HatchGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chick" (
    "id" TEXT NOT NULL,
    "bandNumber" TEXT NOT NULL,
    "hatchDate" TIMESTAMP(3) NOT NULL,
    "flockId" TEXT NOT NULL,
    "hatchGroupId" TEXT,
    "status" "ChickStatus" NOT NULL,
    "sex" "BirdSex" NOT NULL,
    "color" TEXT NOT NULL,
    "observedTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "requestedSex" TEXT NOT NULL,
    "requestedBreed" TEXT NOT NULL,
    "requestedVariety" TEXT NOT NULL,
    "requestedColor" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "chickIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trait" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Trait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "entityType" "NoteEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "entityType" "PhotoEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BirdToTrait" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BirdToTrait_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bird_bandNumber_key" ON "Bird"("bandNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Chick_bandNumber_key" ON "Chick"("bandNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Trait_name_key" ON "Trait"("name");

-- CreateIndex
CREATE INDEX "_BirdToTrait_B_index" ON "_BirdToTrait"("B");

-- AddForeignKey
ALTER TABLE "Bird" ADD CONSTRAINT "Bird_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pairing" ADD CONSTRAINT "Pairing_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "Bird"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pairing" ADD CONSTRAINT "Pairing_damId_fkey" FOREIGN KEY ("damId") REFERENCES "Bird"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HatchGroup" ADD CONSTRAINT "HatchGroup_pairingId_fkey" FOREIGN KEY ("pairingId") REFERENCES "Pairing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chick" ADD CONSTRAINT "Chick_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chick" ADD CONSTRAINT "Chick_hatchGroupId_fkey" FOREIGN KEY ("hatchGroupId") REFERENCES "HatchGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BirdToTrait" ADD CONSTRAINT "_BirdToTrait_A_fkey" FOREIGN KEY ("A") REFERENCES "Bird"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BirdToTrait" ADD CONSTRAINT "_BirdToTrait_B_fkey" FOREIGN KEY ("B") REFERENCES "Trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;
