import { Inject, Injectable } from '@nestjs/common';

import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadFactory } from '../../domain/factories/lead.factory.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class ConvertLeadUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly leadFactory: LeadFactory,
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
	) {}

	async execute(leadId: string) {
		await this.unitOfWork.begin();
		try {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const leads = this.leadRepositoryFactory.create(transactionContext);

			const lead = await leads.findById(Uuid.parse(leadId));
			if (!lead) {
				throw new LeadNotFoundError(leadId);
			}

			const convertedLead = this.leadFactory.convert(lead);
			const converted = await leads.update(convertedLead);
			await this.unitOfWork.commit();
			return converted;
		} catch (error) {
			await this.unitOfWork.rollback();
			throw error;
		}
	}
}

export { ConvertLeadUseCase };
