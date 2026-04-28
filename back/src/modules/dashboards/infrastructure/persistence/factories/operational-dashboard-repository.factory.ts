import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest needs class value for constructor metadata
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IOperationalDashboardRepository } from '../../../domain/repositories/operational-dashboard.repository.js';
import { OperationalDashboardPrismaRepository } from '../repositories/operational-dashboard-prisma.repository.js';

@Injectable()
class OperationalDashboardRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): IOperationalDashboardRepository {
		return new OperationalDashboardPrismaRepository(this.prisma, transactionContext);
	}
}

export { OperationalDashboardRepositoryFactory };
