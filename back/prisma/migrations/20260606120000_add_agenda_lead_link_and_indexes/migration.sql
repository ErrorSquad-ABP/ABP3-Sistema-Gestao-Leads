ALTER TABLE "agenda_items" ADD COLUMN "leadId" UUID;

CREATE INDEX "agenda_items_leadId_idx" ON "agenda_items"("leadId");

CREATE INDEX "agenda_items_userId_leadId_idx" ON "agenda_items"("userId", "leadId");

CREATE INDEX "agenda_items_userId_status_startsAt_idx" ON "agenda_items"("userId", "status", "startsAt");

CREATE INDEX "agenda_items_userId_status_dueAt_idx" ON "agenda_items"("userId", "status", "dueAt");

ALTER TABLE "agenda_items"
ADD CONSTRAINT "agenda_items_leadId_fkey"
FOREIGN KEY ("leadId") REFERENCES "Lead"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
