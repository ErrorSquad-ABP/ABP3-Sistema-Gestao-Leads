import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class FindLeadUseCase {
	constructor(private readonly leadRepositoryFactory: LeadRepositoryFactory) {}

	async execute(leadId: string) {
		const leads = this.leadRepositoryFactory.create();
		const lead = await leads.findById(Uuid.parse(leadId));
		if (!lead) {
			throw new LeadNotFoundError(leadId);
		}
		return lead;
	}
}

export { FindLeadUseCase };
