/**
 * Identifier aliases aligned with the implementation diagram (UUID vs int vs hash).
 */
type UUID = string;

/** Team id aligned with Prisma UUID schema. */
type TeamId = UUID;

/** Store id aligned with Prisma UUID schema. */
type StoreId = UUID;

/** Audit log primary key (hash / opaque string). */
type AuditLogId = string;

export type { AuditLogId, StoreId, TeamId, UUID };
