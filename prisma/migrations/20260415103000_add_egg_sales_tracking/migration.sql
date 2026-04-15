-- CreateEnum
CREATE TYPE "EggSaleType" AS ENUM ('TableEggs', 'HatchingEggs', 'Other');

-- CreateEnum
CREATE TYPE "EggSaleUnit" AS ENUM ('PerEgg', 'PerDozen', 'Flat');

-- CreateTable
CREATE TABLE "EggSaleLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggSaleLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggSaleSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultPricePerEgg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "defaultPricePerDozen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "defaultSaleUnit" "EggSaleUnit" NOT NULL DEFAULT 'PerDozen',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggSaleSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggSale" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "locationId" TEXT NOT NULL,
    "saleType" "EggSaleType" NOT NULL DEFAULT 'TableEggs',
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitType" "EggSaleUnit" NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EggSaleLocation_userId_idx" ON "EggSaleLocation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EggSaleLocation_userId_name_key" ON "EggSaleLocation"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EggSaleSettings_userId_key" ON "EggSaleSettings"("userId");

-- CreateIndex
CREATE INDEX "EggSale_userId_idx" ON "EggSale"("userId");

-- CreateIndex
CREATE INDEX "EggSale_locationId_idx" ON "EggSale"("locationId");

-- CreateIndex
CREATE INDEX "EggSale_saleDate_idx" ON "EggSale"("saleDate");

-- CreateIndex
CREATE INDEX "EggSale_saleType_idx" ON "EggSale"("saleType");

-- AddForeignKey
ALTER TABLE "EggSaleLocation" ADD CONSTRAINT "EggSaleLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggSaleSettings" ADD CONSTRAINT "EggSaleSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggSale" ADD CONSTRAINT "EggSale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggSale" ADD CONSTRAINT "EggSale_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "EggSaleLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
