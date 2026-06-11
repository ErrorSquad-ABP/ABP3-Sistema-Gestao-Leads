CREATE TYPE "AgendaItemType" AS ENUM ('TASK', 'EVENT');

CREATE TYPE "AgendaItemStatus" AS ENUM ('SCHEDULED', 'DONE', 'CANCELLED');

CREATE TYPE "AgendaRecurrence" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

CREATE TABLE "agenda_items" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "AgendaItemType" NOT NULL,
    "status" "AgendaItemStatus" NOT NULL DEFAULT 'SCHEDULED',
    "recurrence" "AgendaRecurrence" NOT NULL DEFAULT 'NONE',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "agenda_items_userId_startsAt_idx" ON "agenda_items"("userId", "startsAt");

CREATE INDEX "agenda_items_userId_dueAt_idx" ON "agenda_items"("userId", "dueAt");

CREATE INDEX "agenda_items_userId_status_idx" ON "agenda_items"("userId", "status");

ALTER TABLE "agenda_items" ADD CONSTRAINT "agenda_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
