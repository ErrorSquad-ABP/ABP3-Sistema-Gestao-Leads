ALTER TABLE "Vehicle"
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "imageAlt" TEXT,
ADD COLUMN "imageProvider" TEXT,
ADD COLUMN "imageProviderPhotoId" TEXT,
ADD COLUMN "imagePhotographerName" TEXT,
ADD COLUMN "imagePhotographerUrl" TEXT,
ADD COLUMN "imageSourceUrl" TEXT,
ADD COLUMN "imageResolvedAt" TIMESTAMP(3);

CREATE INDEX "Vehicle_status_createdAt_idx" ON "Vehicle"("status", "createdAt");
