import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { assertCanonicalDealImportance } from '../../../../shared/domain/enums/deal-importance.enum.js';
import { assertCanonicalDealStage } from '../../../../shared/domain/enums/deal-stage.enum.js';
import { assertCanonicalDealStatus } from '../../../../shared/domain/enums/deal-status.enum.js';
import { Money } from '../../../../shared/domain/value-objects/money.value-object.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadNotFoundError } from '../../../leads/domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadRepositoryFactory } from '../../../leads/infrastructure/persistence/factories/lead-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { DealNotFoundError } from '../../domain/errors/deal-not-found.error.js';
import { ActiveDealForVehicleAlreadyExistsError } from '../../domain/errors/active-deal-for-vehicle-already-exists.error.js';
import { DealVehicleNotAvailableError } from '../../domain/errors/deal-vehicle-not-available.error.js';
import { DealVehicleStoreMismatchError } from '../../domain/errors/deal-vehicle-store-mismatch.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealRepositoryFactory } from '../../infrastructure/persistence/factories/deal-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { DealHistoryRepositoryFactory } from '../../infrastructure/persistence/factories/deal-history-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { VehicleRepositoryFactory } from '../../../vehicles/infrastructure/persistence/factories/vehicle-repository.factory.js';
import { VehicleNotFoundError } from '../../../vehicles/domain/errors/vehicle-not-found.error.js';
import {
	diffDealHistory,
	snapshotDeal,
} from '../helpers/deal-history.helpers.js';
import type { UpdateDealDto } from '../dto/update-deal.dto.js';

@Injectable()
class UpdateDealUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly dealRepositoryFactory: DealRepositoryFactory,
		private readonly dealHistoryRepositoryFactory: DealHistoryRepositoryFactory,
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
	) {}

	async execute(actor: LeadActor, dealId: string, dto: UpdateDealDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const deals = this.dealRepositoryFactory.create(transactionContext);
			const history =
				this.dealHistoryRepositoryFactory.create(transactionContext);
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

			const hasInput =
				dto.vehicleId !== undefined ||
				dto.title !== undefined ||
				dto.value !== undefined ||
				dto.importance !== undefined ||
				dto.stage !== undefined ||
				dto.status !== undefined;
			if (!hasInput) {
				return deal;
			}

			const before = snapshotDeal(deal);

			if (dto.vehicleId !== undefined) {
				const nextVehicleId = Uuid.parse(dto.vehicleId);
				if (!deal.vehicleId.equals(nextVehicleId)) {
					const nextVehicle = await vehicles.findById(nextVehicleId);
					if (!nextVehicle) {
						throw new VehicleNotFoundError(dto.vehicleId);
					}
					if (!nextVehicle.storeId.equals(lead.storeId)) {
						throw new DealVehicleStoreMismatchError(
							dto.vehicleId,
							lead.id.value,
						);
					}
					if (nextVehicle.status !== 'AVAILABLE') {
						throw new DealVehicleNotAvailableError(
							dto.vehicleId,
							nextVehicle.status,
						);
					}
					const existingVehicleOpen =
						await deals.findOpenByVehicleId(nextVehicleId);
					if (existingVehicleOpen) {
						throw new ActiveDealForVehicleAlreadyExistsError(dto.vehicleId);
					}

					const prevVehicle = await vehicles.findById(deal.vehicleId);
					if (
						prevVehicle &&
						prevVehicle.status !== 'INACTIVE' &&
						prevVehicle.status !== 'SOLD'
					) {
						prevVehicle.changeStatus('AVAILABLE');
						await vehicles.update(prevVehicle);
					}

					nextVehicle.changeStatus('RESERVED');
					await vehicles.update(nextVehicle);

					deal.changeVehicle(nextVehicleId);
				}
			}

			if (dto.title !== undefined) {
				deal.changeTitle(dto.title);
			}
			if (dto.value !== undefined) {
				deal.changeValue(Money.fromNullableDecimalString(dto.value));
			}
			if (dto.importance !== undefined) {
				deal.changeImportance(assertCanonicalDealImportance(dto.importance));
			}
			if (dto.stage !== undefined) {
				deal.changeStage(assertCanonicalDealStage(dto.stage));
			}
			if (dto.status !== undefined) {
				deal.changeStatus(assertCanonicalDealStatus(dto.status));
			}

			const after = snapshotDeal(deal);

			if (
				before.status === 'OPEN' &&
				after.status === 'WON' &&
				!lead.isConverted()
			) {
				lead.convert();
				await leads.update(lead);
			}

			if (before.status === 'OPEN' && after.status !== 'OPEN') {
				const vehicle = await vehicles.findById(deal.vehicleId);
				if (vehicle && vehicle.status !== 'INACTIVE') {
					if (after.status === 'WON') {
						vehicle.changeStatus('SOLD');
					} else if (after.status === 'LOST' && vehicle.status !== 'SOLD') {
						vehicle.changeStatus('AVAILABLE');
					}
					await vehicles.update(vehicle);
				}
			}

			const updated = await deals.update(deal);

			const actorUuid = Uuid.parse(actor.userId);
			const lines = diffDealHistory(updated.id, before, after, actorUuid);
			if (lines.length > 0) {
				await history.appendMany(lines);
			}

			if (lines.length > 0) {
				await createAuditLogEntry(tx, {
					action: 'UPDATE_DEAL',
					actorUserId: actor.userId,
					affectedId: updated.id.value,
					description: null,
				});
			}

			return updated;
		});
	}
}

export { UpdateDealUseCase };
