import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { UserNotFoundError } from '../../../users/domain/errors/user-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { TeamNotFoundError } from '../../domain/errors/team-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamAccessPolicy } from '../services/team-access-policy.service.js';
import type { TeamActor } from '../types/team-actor.js';

@Injectable()
class AssignTeamManagerUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly teamAccessPolicy: TeamAccessPolicy,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async execute(
		actor: TeamActor,
		teamId: string,
		managerId: string | null | undefined,
	) {
		if (managerId === undefined) {
			throw new BadRequestException({
				message: 'Informe managerId (uuid do gerente ou null para remover).',
				code: 'team.manager_id.required',
			});
		}

		await this.teamAccessPolicy.assertCanMutateTeam(actor, teamId);

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const teams = this.teamRepositoryFactory.create(transactionContext);
			const users = this.userRepositoryFactory.create(transactionContext);

			const team = await teams.findById(Uuid.parse(teamId));
			if (!team) {
				throw new TeamNotFoundError(teamId);
			}

			if (managerId === null) {
				team.removeManager();
				return teams.update(team);
			}

			const manager = await users.findById(Uuid.parse(managerId));
			if (!manager) {
				throw new UserNotFoundError(managerId);
			}
			team.assignManager(Uuid.parse(managerId), manager.role);
			return teams.update(team);
		});
	}
}

export { AssignTeamManagerUseCase };
