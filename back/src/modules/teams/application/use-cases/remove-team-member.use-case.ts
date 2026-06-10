import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import { TeamNotFoundError } from '../../domain/errors/team-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamAccessPolicy } from '../services/team-access-policy.service.js';
import type { TeamActor } from '../types/team-actor.js';

@Injectable()
class RemoveTeamMemberUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly teamAccessPolicy: TeamAccessPolicy,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
	) {}

	async execute(actor: TeamActor, teamId: string, userId: string) {
		await this.teamAccessPolicy.assertCanMutateTeam(actor, teamId);

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const teams = this.teamRepositoryFactory.create(transactionContext);

			const team = await teams.findById(Uuid.parse(teamId));
			if (!team) {
				throw new TeamNotFoundError(teamId);
			}

			team.removeMember(Uuid.parse(userId));
			const updated = await teams.update(team);
			await createAuditLogEntry(tx, {
				actorUserId: actor.userId,
				action: 'UPDATE',
				entityName: 'Team',
				entityId: updated.id.value,
				metadata: {
					changedFields: ['memberUserIds'],
					removedMemberUserId: userId,
				},
			});

			return updated;
		});
	}
}

export { RemoveTeamMemberUseCase };
