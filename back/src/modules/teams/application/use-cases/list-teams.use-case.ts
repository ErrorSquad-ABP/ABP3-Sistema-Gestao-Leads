import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';

@Injectable()
class ListTeamsUseCase {
	constructor(private readonly teamRepositoryFactory: TeamRepositoryFactory) {}

	execute() {
		const teams = this.teamRepositoryFactory.create();
		return teams.list();
	}
}

export { ListTeamsUseCase };
