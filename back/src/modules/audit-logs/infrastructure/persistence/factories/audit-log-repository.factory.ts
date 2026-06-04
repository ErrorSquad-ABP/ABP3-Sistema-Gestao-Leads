import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IAuditLogRepository } from '../../../domain/repositories/audit-log.repository.js';
import { AuditLogPrismaRepository } from '../repositories/audit-log-prisma.repository.js';

@Injectable()
class AuditLogRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(): IAuditLogRepository {
		return new AuditLogPrismaRepository(this.prisma);
	}
}

export { AuditLogRepositoryFactory };
