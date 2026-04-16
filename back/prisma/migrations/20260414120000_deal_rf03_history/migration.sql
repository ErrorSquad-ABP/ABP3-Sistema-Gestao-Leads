-- CreateEnum
CREATE TYPE "DealImportance" AS ENUM ('COLD', 'WARM', 'HOT');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('INITIAL_CONTACT', 'NEGOTIATION', 'PROPOSAL', 'CLOSING');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "DealHistoryField" AS ENUM ('IMPORTANCE', 'STAGE', 'STATUS', 'TITLE', 'VALUE');

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "importance" "DealImportance",
ADD COLUMN "stage" "DealStage",
ADD COLUMN "status" "DealStatus";

-- Backfill defaults from legacy columns
UPDATE "Deal" AS d
SET
  "importance" = 'WARM'::"DealImportance",
  "stage" = 'NEGOTIATION'::"DealStage",
  "status" = CASE
    WHEN d."closedAt" IS NULL THEN 'OPEN'::"DealStatus"
    ELSE 'LOST'::"DealStatus"
  END;

-- Align closed deals with converted leads (won)
UPDATE "Deal" AS d
SET
  "status" = 'WON'::"DealStatus",
  "closedAt" = COALESCE(d."closedAt", d."updatedAt")
FROM "Lead" AS l
WHERE d."leadId" = l.id
  AND l.status = 'CONVERTED'
  AND d."closedAt" IS NOT NULL;

-- Fix inconsistent open deals when lead is already converted
UPDATE "Deal" AS d
SET
  "status" = 'WON'::"DealStatus",
  "closedAt" = COALESCE(d."closedAt", d."updatedAt")
FROM "Lead" AS l
WHERE d."leadId" = l.id
  AND l.status = 'CONVERTED'
  AND d."status" = 'OPEN'::"DealStatus";

-- At most one OPEN per lead: close duplicates (keep earliest by createdAt)
UPDATE "Deal" AS d
SET
  "status" = 'LOST'::"DealStatus",
  "closedAt" = COALESCE(d."closedAt", d."updatedAt")
WHERE d.id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "leadId"
        ORDER BY "createdAt" ASC, id ASC
      ) AS rn
    FROM "Deal"
    WHERE "status" = 'OPEN'::"DealStatus"
  ) AS ranked
  WHERE rn > 1
);

-- AlterTable
ALTER TABLE "Deal" ALTER COLUMN "importance" SET NOT NULL,
ALTER COLUMN "stage" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Deal_leadId_idx" ON "Deal"("leadId");

-- CreateTable
CREATE TABLE "DealHistory" (
    "id" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "field" "DealHistoryField" NOT NULL,
    "fromValue" TEXT,
    "toValue" TEXT NOT NULL,
    "actorUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealHistory_dealId_createdAt_idx" ON "DealHistory"("dealId", "createdAt");

-- AddForeignKey
ALTER TABLE "DealHistory" ADD CONSTRAINT "DealHistory_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partial unique: at most one OPEN deal per lead
CREATE UNIQUE INDEX "Deal_one_open_per_lead_idx" ON "Deal"("leadId") WHERE ("status" = 'OPEN'::"DealStatus");
