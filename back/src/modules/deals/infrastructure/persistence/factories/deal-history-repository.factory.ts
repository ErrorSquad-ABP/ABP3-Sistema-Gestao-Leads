import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IDealHistoryRepository } from '../../../domain/repositories/deal-history.repository.js';
import { DealHistoryPrismaRepository } from '../repositories/deal-history-prisma.repository.js';

@Injectable()
class DealHistoryRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): IDealHistoryRepository {
		return new DealHistoryPrismaRepository(this.prisma, transactionContext);
	}
}

export { DealHistoryRepositoryFactory };
