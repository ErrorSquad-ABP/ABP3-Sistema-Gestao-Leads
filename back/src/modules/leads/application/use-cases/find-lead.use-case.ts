import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class FindLeadUseCase {
	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, leadId: string) {
		const leads = this.leadRepositoryFactory.create();
		const lead = await leads.findById(Uuid.parse(leadId));
		if (!lead) {
			throw new LeadNotFoundError(leadId);
		}
		await this.leadAccessPolicy.assertCanReadLead(actor, lead);
		return lead;
	}
}

export { FindLeadUseCase };
