import { Inject, Injectable } from '@nestjs/common';

import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';

@Injectable()
class DeleteLeadUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(private readonly leadRepositoryFactory: LeadRepositoryFactory) {}

	async execute(leadId: string): Promise<void> {
		await this.unitOfWork.begin();
		try {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const leads = this.leadRepositoryFactory.create(transactionContext);

			const lead = await leads.findById(leadId);
			if (!lead) {
				throw new LeadNotFoundError(leadId);
			}

			await leads.delete(leadId);
			await this.unitOfWork.commit();
		} catch (error) {
			await this.unitOfWork.rollback();
			throw error;
		}
	}
}

export { DeleteLeadUseCase };
