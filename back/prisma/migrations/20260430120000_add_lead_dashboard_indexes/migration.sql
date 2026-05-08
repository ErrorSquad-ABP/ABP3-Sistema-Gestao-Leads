-- Indexes for operational dashboard period and store-scoped queries.
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_storeId_createdAt_idx" ON "Lead"("storeId", "createdAt");
