import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../../leads/domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadRepositoryFactory } from '../../../leads/infrastructure/persistence/factories/lead-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { DealNotFoundError } from '../../domain/errors/deal-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealRepositoryFactory } from '../../infrastructure/persistence/factories/deal-repository.factory.js';

@Injectable()
class FindDealUseCase {
	constructor(
		private readonly dealRepositoryFactory: DealRepositoryFactory,
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, dealId: string) {
		const deals = this.dealRepositoryFactory.create();
		const leads = this.leadRepositoryFactory.create();

		const row = await deals.findByIdEnriched(Uuid.parse(dealId));
		if (!row) {
			throw new DealNotFoundError(dealId);
		}
		const lead = await leads.findById(Uuid.parse(row.leadId));
		if (!lead) {
			throw new LeadNotFoundError(row.leadId);
		}
		await this.leadAccessPolicy.assertCanReadLead(actor, lead);

		return row;
	}
}

export { FindDealUseCase };
