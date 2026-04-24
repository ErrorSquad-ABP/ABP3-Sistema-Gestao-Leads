-- CreateTable
CREATE TABLE "AccessGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseRole" "UserRole",
    "featureKeys" JSONB NOT NULL,
    "isSystemGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessGroup_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accessGroupId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "AccessGroup_name_key" ON "AccessGroup"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
