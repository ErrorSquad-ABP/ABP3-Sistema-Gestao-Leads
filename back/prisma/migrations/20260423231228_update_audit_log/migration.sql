/*
  Warnings:

  - You are about to drop the column `entityId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `entityName` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `AuditLog` table. All the data in the column will be lost.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Limpar dados incompatíveis com o novo ENUM
TRUNCATE "AuditLog";

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_LOGIN', 'CREATE_LEAD', 'UPDATE_LEAD', 'DELETE_LEAD', 'CREATE_TEAM', 'UPDATE_TEAM', 'DELETE_TEAM', 'CREATE_DEAL', 'UPDATE_DEAL', 'DELETE_DEAL', 'CREATE_STORE', 'UPDATE_STORE', 'DELETE_STORE');

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "entityId",
DROP COLUMN "entityName",
DROP COLUMN "metadata",
ADD COLUMN     "affectedId" TEXT,
ADD COLUMN     "description" TEXT,
DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL;
