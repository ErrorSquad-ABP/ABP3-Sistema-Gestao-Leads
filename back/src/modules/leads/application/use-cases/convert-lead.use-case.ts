import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadEventRepositoryFactory } from '../../infrastructure/persistence/factories/lead-event-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class ConvertLeadUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadEventRepositoryFactory: LeadEventRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, leadId: string) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const leads = this.leadRepositoryFactory.create(transactionContext);
			const leadEvents =
				this.leadEventRepositoryFactory.create(transactionContext);

			const lead = await leads.findById(Uuid.parse(leadId));
			if (!lead) {
				throw new LeadNotFoundError(leadId);
			}
			await this.leadAccessPolicy.assertCanMutateLead(actor, lead);

			lead.convert();
			const updated = await leads.update(lead);
			await leadEvents.append({
				leadId: updated.id,
				actorUserId: Uuid.parse(actor.userId),
				type: 'CONVERTED',
				title: 'Lead convertido',
				description: 'Lead marcado como convertido no fluxo comercial.',
				payload: { status: 'CONVERTED' },
			});
			return updated;
		});
	}
}

export { ConvertLeadUseCase };
