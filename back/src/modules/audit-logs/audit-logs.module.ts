import { Module } from '@nestjs/common';

import { ListAuditLogsUseCase } from './application/use-cases/list-audit-logs.use-case.js';
import { AuditLogRepositoryFactory } from './infrastructure/persistence/factories/audit-log-repository.factory.js';
import { AuditLogController } from './presentation/controllers/audit-log.controller.js';

@Module({
	controllers: [AuditLogController],
	providers: [AuditLogRepositoryFactory, ListAuditLogsUseCase],
})
class AuditLogsModule {}

export { AuditLogsModule };
