import type { AuditLog } from '../entities/audit-log.entity.js';

/**
 * Persistence port for {@link AuditLog} (diagram: IAuditLogRepository).
 */
interface IAuditLogRepository {
	create(log: AuditLog): Promise<AuditLog>;
	list(): Promise<AuditLog[]>;
}

export type { IAuditLogRepository };
