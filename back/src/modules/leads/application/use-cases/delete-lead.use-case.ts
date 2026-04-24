import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';
import { AuditLogService } from '../../../audit-logs/domain/utils/audit-log.service.js'
import type { Prisma } from '../../../../generated/prisma/client.js';

@Injectable()
class DeleteLeadUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
		private readonly auditLogService: AuditLogService,

	) { }

	async execute(actor: LeadActor, leadId: string): Promise<void> {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const leads = this.leadRepositoryFactory.create(transactionContext);

			const leadIdVo = Uuid.parse(leadId);
			const lead = await leads.findById(leadIdVo);
			if (!lead) {
				throw new LeadNotFoundError(leadId);
			}
			await this.leadAccessPolicy.assertCanMutateLead(actor, lead);

			await leads.delete(leadIdVo);

			const tx = transactionContext.client as Prisma.TransactionClient;
			await this.auditLogService.log(tx, {
				action: 'DELETE_LEAD',
				actorUserId: actor.userId,
				affectedId: leadId,
			});
		});
	}
}

export { DeleteLeadUseCase };
