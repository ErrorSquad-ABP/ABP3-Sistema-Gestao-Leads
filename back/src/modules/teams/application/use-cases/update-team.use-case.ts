import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { TeamInvalidManagerError } from '../../domain/errors/team-invalid-manager.error.js';
import { TeamNotFoundError } from '../../domain/errors/team-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { TeamFactory } from '../../domain/factories/team.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
import type { UpdateTeamDto } from '../dto/update-team.dto.js';

@Injectable()
class UpdateTeamUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly teamFactory: TeamFactory,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async execute(teamId: string, dto: UpdateTeamDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const teams = this.teamRepositoryFactory.create(transactionContext);
			const users = this.userRepositoryFactory.create(transactionContext);

			const existing = await teams.findById(Uuid.parse(teamId));
			if (!existing) {
				throw new TeamNotFoundError(teamId);
			}

			if (dto.managerId) {
				const manager = await users.findById(Uuid.parse(dto.managerId));
				if (!manager) {
					throw new TeamInvalidManagerError(dto.managerId);
				}
			}

			const updatedTeam = this.teamFactory.update(existing, dto);
			return teams.update(updatedTeam);
		});
	}
}

export { UpdateTeamUseCase };
