import { Inject, Injectable } from '@nestjs/common';

import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import type { ReassignLeadDto } from '../dto/reassign-lead.dto.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadFactory } from '../../domain/factories/lead.factory.js';
import { LeadInvalidOwnerError } from '../../domain/errors/lead-invalid-owner.error.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';

@Injectable()
class ReassignLeadUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly leadFactory: LeadFactory,
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async execute(leadId: string, dto: ReassignLeadDto) {
		await this.unitOfWork.begin();
		try {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);
			const leads = this.leadRepositoryFactory.create(transactionContext);

			const lead = await leads.findById(leadId);
			if (!lead) {
				throw new LeadNotFoundError(leadId);
			}

			if (dto.ownerUserId) {
				const owner = await users.findById(dto.ownerUserId);
				if (!owner) {
					throw new LeadInvalidOwnerError(dto.ownerUserId);
				}
			}

			const updatedLead = this.leadFactory.reassign(lead, dto.ownerUserId);
			const updated = await leads.update(updatedLead);
			await this.unitOfWork.commit();
			return updated;
		} catch (error) {
			await this.unitOfWork.rollback();
			throw error;
		}
	}
}

export { ReassignLeadUseCase };
