import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
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
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { VehicleRepositoryFactory } from '../../../vehicles/infrastructure/persistence/factories/vehicle-repository.factory.js';

@Injectable()
class DeleteDealUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly dealRepositoryFactory: DealRepositoryFactory,
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
	) {}

	async execute(actor: LeadActor, dealId: string): Promise<void> {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const deals = this.dealRepositoryFactory.create(transactionContext);
			const leads = this.leadRepositoryFactory.create(transactionContext);
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);

			const deal = await deals.findById(Uuid.parse(dealId));
			if (!deal) {
				throw new DealNotFoundError(dealId);
			}
			const lead = await leads.findById(deal.leadId);
			if (!lead) {
				throw new LeadNotFoundError(deal.leadId.value);
			}
			await this.leadAccessPolicy.assertCanMutateLead(actor, lead);

			if (deal.status === 'OPEN') {
				const vehicle = await vehicles.findById(deal.vehicleId);
				if (
					vehicle &&
					vehicle.status !== 'INACTIVE' &&
					vehicle.status !== 'SOLD'
				) {
					vehicle.changeStatus('AVAILABLE');
					await vehicles.update(vehicle);
				}
			}

			await deals.delete(Uuid.parse(dealId));

			await createAuditLogEntry(tx, {
				action: 'DELETE_DEAL',
				actorUserId: actor.userId,
				affectedId: dealId,
				description: null,
			});
		});
	}
}

export { DeleteDealUseCase };
