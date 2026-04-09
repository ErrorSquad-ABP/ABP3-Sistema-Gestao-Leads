import type { Uuid } from '../value-objects/uuid.value-object.js';

/**
 * Aliases nominais sobre {@link Uuid} (todos `@db.Uuid` no Prisma, inclusive AuditLog).
 */
type AuditLogId = Uuid;
type StoreId = Uuid;
type TeamId = Uuid;
type UUID = Uuid;

export { Uuid } from '../value-objects/uuid.value-object.js';
export type { AuditLogId, StoreId, TeamId, UUID };
