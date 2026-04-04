import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreFactory } from '../../domain/factories/store.factory.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';
import type { UpdateStoreDto } from '../dto/update-store.dto.js';

@Injectable()
class UpdateStoreUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly storeFactory: StoreFactory,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(storeId: string, dto: UpdateStoreDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const stores = this.storeRepositoryFactory.create(transactionContext);

			const existing = await stores.findById(Uuid.parse(storeId));
			if (!existing) {
				throw new StoreNotFoundError(storeId);
			}

			const updatedStore = this.storeFactory.update(existing, dto);
			return stores.update(updatedStore);
		});
	}
}

export { UpdateStoreUseCase };
