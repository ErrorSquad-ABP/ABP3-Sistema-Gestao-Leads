import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest needs the PrismaService class value for constructor injection metadata
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { ITeamRepository } from '../../../domain/repositories/team.repository.js';
import { TeamPrismaRepository } from '../repositories/team-prisma.repository.js';

@Injectable()
class TeamRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): ITeamRepository {
		return new TeamPrismaRepository(this.prisma, transactionContext);
	}
}

export { TeamRepositoryFactory };
