import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamAccessPolicy } from '../services/team-access-policy.service.js';
import type { TeamActor } from '../types/team-actor.js';

@Injectable()
class ListTeamsUseCase {
	constructor(
		private readonly teamAccessPolicy: TeamAccessPolicy,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
	) {}

	async execute(actor: TeamActor) {
		const scope = await this.teamAccessPolicy.listTeamIdsForActor(actor);
		const teams = this.teamRepositoryFactory.create();
		if (scope.mode === 'all') {
			return teams.list();
		}
		return teams.listByIds(scope.ids.map((id) => Uuid.parse(id)));
	}
}

export { ListTeamsUseCase };
