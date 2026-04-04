import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { TeamNotFoundError } from '../../domain/errors/team-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';

@Injectable()
class FindTeamUseCase {
	constructor(private readonly teamRepositoryFactory: TeamRepositoryFactory) {}

	async execute(teamId: string) {
		const teams = this.teamRepositoryFactory.create();
		const team = await teams.findById(Uuid.parse(teamId));
		if (!team) {
			throw new TeamNotFoundError(teamId);
		}
		return team;
	}
}

export { FindTeamUseCase };
