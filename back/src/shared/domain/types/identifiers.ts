/**
 * Identifier aliases aligned with the implementation diagram (UUID vs int vs hash).
 */
type UUID = string;

/** Surrogate integer id for Team (diagram). */
type TeamId = number;

/** Surrogate integer id for Store (diagram). */
type StoreId = number;

/** Audit log primary key (hash / opaque string). */
type AuditLogId = string;

export type { AuditLogId, StoreId, TeamId, UUID };
