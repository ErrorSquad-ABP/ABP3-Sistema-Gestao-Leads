import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest needs the PrismaService class value for constructor injection metadata
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository.js';
import { CustomerPrismaRepository } from '../repositories/customer-prisma.repository.js';

@Injectable()
class CustomerRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): ICustomerRepository {
		return new CustomerPrismaRepository(this.prisma, transactionContext);
	}
}

export { CustomerRepositoryFactory };
