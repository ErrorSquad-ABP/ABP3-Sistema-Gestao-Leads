import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { UserNotFoundError } from '../../../users/domain/errors/user-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { TeamNotFoundError } from '../../domain/errors/team-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
import type { AddTeamMemberDto } from '../dto/add-team-member.dto.js';

@Injectable()
class AddTeamMemberUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async execute(teamId: string, dto: AddTeamMemberDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const teams = this.teamRepositoryFactory.create(transactionContext);
			const users = this.userRepositoryFactory.create(transactionContext);

			const team = await teams.findById(Uuid.parse(teamId));
			if (!team) {
				throw new TeamNotFoundError(teamId);
			}

			const user = await users.findById(Uuid.parse(dto.userId));
			if (!user) {
				throw new UserNotFoundError(dto.userId);
			}

			team.addMember(Uuid.parse(dto.userId));
			return teams.update(team);
		});
	}
}

export { AddTeamMemberUseCase };
