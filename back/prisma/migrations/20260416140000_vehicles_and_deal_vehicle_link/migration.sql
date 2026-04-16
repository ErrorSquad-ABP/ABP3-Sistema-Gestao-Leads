-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SupportedFuelType" AS ENUM (
  'GASOLINE',
  'ETHANOL',
  'FLEX',
  'DIESEL',
  'ELECTRIC',
  'HYBRID',
  'PLUG_IN_HYBRID',
  'CNG'
);

-- ExtendEnum
ALTER TYPE "DealHistoryField" ADD VALUE 'VEHICLE';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "vehicleInterestText" TEXT;

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT,
    "modelYear" INTEGER NOT NULL,
    "manufactureYear" INTEGER,
    "color" TEXT,
    "mileage" INTEGER NOT NULL,
    "supportedFuelType" "SupportedFuelType" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "status" "VehicleStatus" NOT NULL,
    "plate" TEXT,
    "vin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vehicle_storeId_idx" ON "Vehicle"("storeId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable (phase 1: nullable for backfill)
ALTER TABLE "Deal" ADD COLUMN "vehicleId" UUID;

-- Backfill vehicles for existing deals.
-- Strategy: create one placeholder vehicle per existing Deal using the same UUID as the Deal id.
INSERT INTO "Vehicle" (
  "id",
  "storeId",
  "brand",
  "model",
  "version",
  "modelYear",
  "manufactureYear",
  "color",
  "mileage",
  "supportedFuelType",
  "price",
  "status",
  "plate",
  "vin",
  "createdAt",
  "updatedAt"
)
SELECT
  d."id" AS "id",
  l."storeId" AS "storeId",
  'LEGACY' AS "brand",
  'UNKNOWN' AS "model",
  NULL AS "version",
  0 AS "modelYear",
  NULL AS "manufactureYear",
  NULL AS "color",
  0 AS "mileage",
  'FLEX'::"SupportedFuelType" AS "supportedFuelType",
  COALESCE(d."value", 0.00) AS "price",
  CASE
    WHEN d."status" = 'OPEN'::"DealStatus" THEN 'RESERVED'::"VehicleStatus"
    WHEN d."status" = 'WON'::"DealStatus" THEN 'SOLD'::"VehicleStatus"
    ELSE 'AVAILABLE'::"VehicleStatus"
  END AS "status",
  NULL AS "plate",
  NULL AS "vin",
  COALESCE(d."createdAt", CURRENT_TIMESTAMP) AS "createdAt",
  COALESCE(d."updatedAt", CURRENT_TIMESTAMP) AS "updatedAt"
FROM "Deal" AS d
JOIN "Lead" AS l ON l."id" = d."leadId"
WHERE d."vehicleId" IS NULL
  AND NOT EXISTS (SELECT 1 FROM "Vehicle" v WHERE v."id" = d."id");

-- Backfill Deal.vehicleId
UPDATE "Deal" SET "vehicleId" = "id" WHERE "vehicleId" IS NULL;

-- AlterTable (phase 2: enforce required)
ALTER TABLE "Deal" ALTER COLUMN "vehicleId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Deal_vehicleId_idx" ON "Deal"("vehicleId");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Partial unique: at most one OPEN deal per vehicle
CREATE UNIQUE INDEX "Deal_one_open_per_vehicle_idx" ON "Deal"("vehicleId") WHERE ("status" = 'OPEN'::"DealStatus");

