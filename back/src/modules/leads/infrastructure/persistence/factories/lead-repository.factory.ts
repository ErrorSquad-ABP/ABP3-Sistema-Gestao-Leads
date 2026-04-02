import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest needs the PrismaService class value for constructor injection metadata
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { ILeadRepository } from '../../../domain/repositories/lead.repository.js';
import { LeadPrismaRepository } from '../repositories/lead-prisma.repository.js';

@Injectable()
class LeadRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): ILeadRepository {
		return new LeadPrismaRepository(this.prisma, transactionContext);
	}
}

export { LeadRepositoryFactory };
