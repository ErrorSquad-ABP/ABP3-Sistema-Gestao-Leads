import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IDealRepository } from '../../../domain/repositories/deal.repository.js';
import { DealPrismaRepository } from '../repositories/deal-prisma.repository.js';

@Injectable()
class DealRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): IDealRepository {
		return new DealPrismaRepository(this.prisma, transactionContext);
	}
}

export { DealRepositoryFactory };
