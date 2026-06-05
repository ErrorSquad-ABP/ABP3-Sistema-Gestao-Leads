import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
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

	async execute(storeId: string, dto: UpdateStoreDto) {
		if (!hasStoreUpdatePayload(dto)) {
			throw new DomainValidationError(
				'Informe ao menos um campo para atualizar a loja.',
				{ code: 'store.update.no_fields' },
			);
		}

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
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

			return stores.update(existing);
		});
	}
}

export { UpdateStoreUseCase };
