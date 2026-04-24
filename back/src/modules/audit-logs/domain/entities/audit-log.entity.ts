import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { AuditAction } from '../../../../shared/domain/enums/audit-action.enum.ts';
import type {
	AuditLogId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';

/**
 * Audit log aggregate root (operational context: audit-logs).
 */
class AuditLog extends AggregateRoot {
	readonly id: AuditLogId;
	readonly action: AuditAction;
	readonly actorUserId: UUID | null;
	readonly affectedId: string | null;
	readonly description: string | null;
	readonly createdAt: Date;

	constructor(
		id: AuditLogId,
		action: AuditAction,
		actorUserId: UUID | null,
		affectedId: string | null,
		description: string | null,
		createdAt: Date,
	) {
		super();
		this.id = id;
		this.action = action;
		this.actorUserId = actorUserId;
		this.affectedId = affectedId;
		this.description = description;
		this.createdAt = createdAt;
	}
}

export { AuditLog };