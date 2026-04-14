import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { LeadInvalidOwnerError } from '../../domain/errors/lead-invalid-owner.error.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';
import type { ReassignLeadDto } from '../dto/reassign-lead.dto.js';

@Injectable()
class ReassignLeadUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, leadId: string, dto: ReassignLeadDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);
			const leads = this.leadRepositoryFactory.create(transactionContext);

			const lead = await leads.findById(Uuid.parse(leadId));
			if (!lead) {
				throw new LeadNotFoundError(leadId);
			}
			await this.leadAccessPolicy.assertCanMutateLead(actor, lead);

			if (dto.ownerUserId) {
				const owner = await users.findById(Uuid.parse(dto.ownerUserId));
				if (!owner) {
					throw new LeadInvalidOwnerError(dto.ownerUserId);
				}
			}
			await this.leadAccessPolicy.assertCanAssignOwner(
				actor,
				lead.storeId.value,
				dto.ownerUserId,
			);

			lead.reassign(
				dto.ownerUserId === null ? null : Uuid.parse(dto.ownerUserId),
			);
			return leads.update(lead);
		});
	}
}

export { ReassignLeadUseCase };
