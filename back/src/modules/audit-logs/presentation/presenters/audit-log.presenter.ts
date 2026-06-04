import type { AuditLogResponseDto } from '../../application/dto/audit-log-response.dto.js';
import type { AuditLog } from '../../domain/entities/audit-log.entity.js';

class AuditLogPresenter {
	static toResponse(log: AuditLog): AuditLogResponseDto {
		return {
			id: log.id.value,
			actorUserId: log.actorUserId?.value ?? null,
			actor:
				log.actor === null
					? null
					: {
							id: log.actor.id.value,
							name: log.actor.name,
							email: log.actor.email,
						},
			action: log.actionType,
			entityName: log.entityName,
			entityId: log.entityId,
			metadata: log.metadata,
			createdAt: log.createdAt.toISOString(),
		};
	}

	static toResponseList(logs: readonly AuditLog[]): AuditLogResponseDto[] {
		return logs.map((log) => AuditLogPresenter.toResponse(log));
	}
}

export { AuditLogPresenter };
