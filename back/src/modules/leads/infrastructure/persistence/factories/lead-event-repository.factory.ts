import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { ILeadEventRepository } from '../../../domain/repositories/lead-event.repository.js';
import { LeadEventPrismaRepository } from '../repositories/lead-event-prisma.repository.js';

@Injectable()
class LeadEventRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): ILeadEventRepository {
		return new LeadEventPrismaRepository(this.prisma, transactionContext);
	}
}

export { LeadEventRepositoryFactory };
