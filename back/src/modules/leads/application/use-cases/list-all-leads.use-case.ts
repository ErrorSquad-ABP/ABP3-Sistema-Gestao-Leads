import { Injectable } from '@nestjs/common';

import type { LeadListFilters } from '../../domain/repositories/lead.repository.js';
import type { LeadListPagination } from '../../domain/types/lead-list-page.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class ListAllLeadsUseCase {
	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(
		actor: LeadActor,
		pagination: LeadListPagination,
		filters?: LeadListFilters,
	) {
		await this.leadAccessPolicy.assertCanListAllLeads(actor);
		const leads = this.leadRepositoryFactory.create();
		return leads.listAll(pagination, filters);
	}
}

export { ListAllLeadsUseCase };
