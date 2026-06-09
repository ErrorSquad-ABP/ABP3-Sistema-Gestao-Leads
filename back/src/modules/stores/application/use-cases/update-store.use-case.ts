import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js';
import type { StoreDetails } from '../../domain/entities/store.entity.js';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';
import type { UpdateStoreDto } from '../dto/update-store.dto.js';

function hasStoreUpdatePayload(dto: UpdateStoreDto): boolean {
	return (
		dto.name !== undefined ||
		dto.addressLine !== undefined ||
		dto.city !== undefined ||
		dto.coverage !== undefined ||
		dto.distributionRegion !== undefined ||
		dto.region !== undefined ||
		dto.scope !== undefined ||
		dto.state !== undefined
	);
}

function collectStoreChangedFields(dto: UpdateStoreDto): string[] {
	const changedFields: string[] = [];

	if (dto.name !== undefined) {
		changedFields.push('name');
	}
	if (dto.addressLine !== undefined) {
		changedFields.push('addressLine');
	}
	if (dto.city !== undefined) {
		changedFields.push('city');
	}
	if (dto.coverage !== undefined) {
		changedFields.push('coverage');
	}
	if (dto.distributionRegion !== undefined) {
		changedFields.push('distributionRegion');
	}
	if (dto.region !== undefined) {
		changedFields.push('region');
	}
	if (dto.scope !== undefined) {
		changedFields.push('scope');
	}
	if (dto.state !== undefined) {
		changedFields.push('state');
	}

	return changedFields;
}

function buildStoreDetailUpdates(dto: UpdateStoreDto): Partial<StoreDetails> {
	return {
		...(dto.addressLine !== undefined && {
			addressLine: dto.addressLine ?? null,
		}),
		...(dto.city !== undefined && { city: dto.city ?? null }),
		...(dto.coverage !== undefined && { coverage: dto.coverage ?? null }),
		...(dto.distributionRegion !== undefined && {
			distributionRegion: dto.distributionRegion ?? null,
		}),
		...(dto.region !== undefined && { region: dto.region ?? null }),
		...(dto.scope !== undefined && { scope: dto.scope ?? null }),
		...(dto.state !== undefined && { state: dto.state ?? null }),
	};
}

@Injectable()
class UpdateStoreUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(actorUserId: string, storeId: string, dto: UpdateStoreDto) {
		if (!hasStoreUpdatePayload(dto)) {
			throw new DomainValidationError(
				'Informe ao menos um campo para atualizar a loja.',
				{ code: 'store.update.no_fields' },
			);
		}

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const tx = transactionContext.client as Prisma.TransactionClient;
			const stores = this.storeRepositoryFactory.create(transactionContext);

			const existing = await stores.findById(Uuid.parse(storeId));
			if (!existing) {
				throw new StoreNotFoundError(storeId);
			}

			if (dto.name !== undefined) {
				const next = Name.create(dto.name);
				if (!next.equals(existing.name)) {
					existing.rename(next);
				}
			}

			existing.updateDetails(buildStoreDetailUpdates(dto));

			const updated = await stores.update(existing);

			await createAuditLogEntry(tx, {
				actorUserId,
				action: 'UPDATE',
				entityName: 'Store',
				entityId: updated.id.value,
				metadata: { changedFields: collectStoreChangedFields(dto) },
			});

			return updated;
		});
	}
}

export { UpdateStoreUseCase };
