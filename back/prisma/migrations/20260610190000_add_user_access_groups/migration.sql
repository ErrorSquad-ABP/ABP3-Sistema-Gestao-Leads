-- CreateTable
CREATE TABLE "UserAccessGroup" (
    "userId" UUID NOT NULL,
    "accessGroupId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAccessGroup_pkey" PRIMARY KEY ("userId","accessGroupId")
);

-- CreateIndex
CREATE INDEX "UserAccessGroup_accessGroupId_idx" ON "UserAccessGroup"("accessGroupId");

-- AddForeignKey
ALTER TABLE "UserAccessGroup" ADD CONSTRAINT "UserAccessGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccessGroup" ADD CONSTRAINT "UserAccessGroup_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: preserva vínculos existentes antes de remover a coluna legada
INSERT INTO "UserAccessGroup" ("userId", "accessGroupId")
SELECT "id", "accessGroupId"
FROM "User"
WHERE "accessGroupId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_accessGroupId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessGroupId";
