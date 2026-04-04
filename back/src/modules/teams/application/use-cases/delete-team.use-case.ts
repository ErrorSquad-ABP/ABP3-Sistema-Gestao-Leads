import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { TeamNotFoundError } from '../../domain/errors/team-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';

@Injectable()
class DeleteTeamUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(private readonly teamRepositoryFactory: TeamRepositoryFactory) {}

	async execute(teamId: string): Promise<void> {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const teams = this.teamRepositoryFactory.create(transactionContext);

			const teamIdVo = Uuid.parse(teamId);
			const team = await teams.findById(teamIdVo);
			if (!team) {
				throw new TeamNotFoundError(teamId);
			}

			await teams.delete(teamIdVo);
		});
	}
}

export { DeleteTeamUseCase };
