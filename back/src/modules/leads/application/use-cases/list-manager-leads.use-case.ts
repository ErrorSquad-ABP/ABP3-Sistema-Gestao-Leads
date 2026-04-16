import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
import type { LeadListPagination } from '../../domain/types/lead-list-page.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class ListManagerLeadsUseCase {
	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, pagination: LeadListPagination) {
		const teamIds =
			await this.leadAccessPolicy.resolveManagerListTeamIds(actor);
		const leads = this.leadRepositoryFactory.create();
		return leads.listByReadableTeams(teamIds, pagination);
	}
}

export { ListManagerLeadsUseCase };
