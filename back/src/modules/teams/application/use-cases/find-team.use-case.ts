import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { TeamNotFoundError } from '../../domain/errors/team-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamAccessPolicy } from '../services/team-access-policy.service.js';
import type { TeamActor } from '../types/team-actor.js';

@Injectable()
class FindTeamUseCase {
	constructor(
		private readonly teamAccessPolicy: TeamAccessPolicy,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
	) {}

	async execute(actor: TeamActor, teamId: string) {
		await this.teamAccessPolicy.assertCanReadTeam(actor, teamId);
		const teams = this.teamRepositoryFactory.create();
		const team = await teams.findById(Uuid.parse(teamId));
		if (!team) {
			throw new TeamNotFoundError(teamId);
		}
		return team;
	}
}

export { FindTeamUseCase };
