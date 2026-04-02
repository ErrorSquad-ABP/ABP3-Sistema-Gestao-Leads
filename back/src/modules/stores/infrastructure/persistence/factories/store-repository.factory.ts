import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest needs the PrismaService class value for constructor injection metadata
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IStoreRepository } from '../../../domain/repositories/store.repository.js';
import { StorePrismaRepository } from '../repositories/store-prisma.repository.js';

@Injectable()
class StoreRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): IStoreRepository {
		return new StorePrismaRepository(this.prisma, transactionContext);
	}
}

export { StoreRepositoryFactory };
