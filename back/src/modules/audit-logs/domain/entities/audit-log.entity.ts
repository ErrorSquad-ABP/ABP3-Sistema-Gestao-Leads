import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { AuditActionType } from '../../../../shared/domain/enums/audit-action-type.enum.js';
import type {
	AuditLogId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';

/**
 * Audit log aggregate root (operational context: audit-logs).
 */
class AuditLog extends AggregateRoot {
	readonly id: AuditLogId;
	readonly actorUserId: UUID | null;
	readonly actionType: AuditActionType;
	readonly entityName: string;
	readonly entityId: string;
	readonly createdAt: Date;

	constructor(
		id: AuditLogId,
		actorUserId: UUID | null,
		actionType: AuditActionType,
		entityName: string,
		entityId: string,
		createdAt: Date,
	) {
		super();
		this.id = id;
		this.actorUserId = actorUserId;
		this.actionType = actionType;
		this.entityName = entityName;
		this.entityId = entityId;
		this.createdAt = createdAt;
	}
}

export { AuditLog };
