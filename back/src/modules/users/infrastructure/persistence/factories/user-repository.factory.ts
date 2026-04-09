import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest needs the PrismaService class value for constructor injection metadata
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';
import { UserPrismaRepository } from '../repositories/user-prisma.repository.js';

@Injectable()
class UserRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): IUserRepository {
		return new UserPrismaRepository(this.prisma, transactionContext);
	}
}

export { UserRepositoryFactory };
