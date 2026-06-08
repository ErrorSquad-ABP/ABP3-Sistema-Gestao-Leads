import { Injectable } from '@nestjs/common';

import type { AuditActionType } from '../../../../shared/domain/enums/audit-action-type.enum.js';
import type { AuditLog } from '../../domain/entities/audit-log.entity.js';
import type { AuditLogCategory } from '../../domain/repositories/audit-log.repository.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AuditLogRepositoryFactory } from '../../infrastructure/persistence/factories/audit-log-repository.factory.js';

type ListAuditLogsQuery = {
	readonly page: number;
	readonly limit: number;
	readonly category?: AuditLogCategory;
	readonly action?: AuditActionType;
	readonly user?: string;
	readonly startDate?: Date;
	readonly endDate?: Date;
};

type ListAuditLogsResult = {
	readonly items: readonly AuditLog[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
};

@Injectable()
class ListAuditLogsUseCase {
	constructor(
		private readonly auditLogRepositoryFactory: AuditLogRepositoryFactory,
	) {}

	async execute(query: ListAuditLogsQuery): Promise<ListAuditLogsResult> {
		const auditLogs = this.auditLogRepositoryFactory.create();
		return auditLogs.listPaged(query);
	}
}

export { ListAuditLogsUseCase };
export type { ListAuditLogsQuery, ListAuditLogsResult };
