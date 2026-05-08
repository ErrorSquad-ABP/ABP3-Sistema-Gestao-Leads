import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { parseLeadStatus } from '../../../../shared/domain/enums/lead-status.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadSource } from '../../../../shared/domain/value-objects/lead-source.value-object.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { CustomerRepositoryFactory } from '../../../customers/infrastructure/persistence/factories/customer-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { StoreRepositoryFactory } from '../../../stores/infrastructure/persistence/factories/store-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { LeadInvalidCustomerError } from '../../domain/errors/lead-invalid-customer.error.js';
import { LeadInvalidOwnerError } from '../../domain/errors/lead-invalid-owner.error.js';
import { LeadInvalidStoreError } from '../../domain/errors/lead-invalid-store.error.js';
import { LeadNotFoundError } from '../../domain/errors/lead-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
import type { LeadActor } from '../types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadEventRepositoryFactory } from '../../infrastructure/persistence/factories/lead-event-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadRepositoryFactory } from '../../infrastructure/persistence/factories/lead-repository.factory.js';
import type { UpdateLeadDto } from '../dto/update-lead.dto.js';

type LeadUpdateChange = {
	readonly field: string;
	readonly fromValue: string | null;
	readonly toValue: string | null;
};

function collectLeadUpdateChanges(
	existing: {
		readonly customerId: { readonly value: string };
		readonly storeId: { readonly value: string };
		readonly ownerUserId: { readonly value: string } | null;
		readonly source: { readonly value: string };
		readonly status: string;
		readonly vehicleInterestText: string | null;
	},
	dto: UpdateLeadDto,
	nextStatus: string,
): LeadUpdateChange[] {
	const changes: LeadUpdateChange[] = [];
	const pushIfChanged = (
		field: string,
		fromValue: string | null,
		toValue: string | null,
	) => {
		if (fromValue === toValue) {
			return;
		}
		changes.push({ field, fromValue, toValue });
	};
	pushIfChanged('customerId', existing.customerId.value, dto.customerId);
	pushIfChanged('storeId', existing.storeId.value, dto.storeId);
	pushIfChanged(
		'ownerUserId',
		existing.ownerUserId?.value ?? null,
		dto.ownerUserId,
	);
	pushIfChanged('source', existing.source.value, dto.source);
	pushIfChanged('status', existing.status, nextStatus);
	if (dto.vehicleInterestText !== undefined) {
		pushIfChanged(
			'vehicleInterestText',
			existing.vehicleInterestText,
			dto.vehicleInterestText ?? null,
		);
	}
	return changes;
}

@Injectable()
class UpdateLeadUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly leadRepositoryFactory: LeadRepositoryFactory,
		private readonly leadEventRepositoryFactory: LeadEventRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly customerRepositoryFactory: CustomerRepositoryFactory,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(actor: LeadActor, leadId: string, dto: UpdateLeadDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);
			const customers =
				this.customerRepositoryFactory.create(transactionContext);
			const stores = this.storeRepositoryFactory.create(transactionContext);
			const leads = this.leadRepositoryFactory.create(transactionContext);
			const leadEvents =
				this.leadEventRepositoryFactory.create(transactionContext);

			const existing = await leads.findById(Uuid.parse(leadId));
			if (!existing) {
				throw new LeadNotFoundError(leadId);
			}
			await this.leadAccessPolicy.assertCanMutateLead(actor, existing);

			const customer = await customers.findById(Uuid.parse(dto.customerId));
			if (!customer) {
				throw new LeadInvalidCustomerError(dto.customerId);
			}

			const store = await stores.findById(Uuid.parse(dto.storeId));
			if (!store) {
				throw new LeadInvalidStoreError(dto.storeId);
			}

			if (dto.ownerUserId) {
				const owner = await users.findById(Uuid.parse(dto.ownerUserId));
				if (!owner) {
					throw new LeadInvalidOwnerError(dto.ownerUserId);
				}
			}
			await this.leadAccessPolicy.assertCanCreateLead(actor, {
				storeId: dto.storeId,
				ownerUserId: dto.ownerUserId,
			});

			const nextStatus = parseLeadStatus(dto.status);
			const changes = collectLeadUpdateChanges(existing, dto, nextStatus);
			existing.changeCustomer(Uuid.parse(dto.customerId));
			existing.changeStore(Uuid.parse(dto.storeId));
			existing.changeSource(LeadSource.create(dto.source));
			existing.changeStatus(nextStatus);
			existing.reassign(
				dto.ownerUserId === null ? null : Uuid.parse(dto.ownerUserId),
			);
			if (dto.vehicleInterestText !== undefined) {
				existing.changeVehicleInterestText(dto.vehicleInterestText ?? null);
			}

			const updated = await leads.update(existing);
			if (changes.length > 0) {
				await leadEvents.append({
					leadId: updated.id,
					actorUserId: Uuid.parse(actor.userId),
					type: 'UPDATED',
					title: 'Lead atualizado',
					description: 'Dados operacionais do lead foram atualizados.',
					payload: { changes },
				});
			}
			return updated;
		});
	}
}

export { UpdateLeadUseCase };
