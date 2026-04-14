import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreFactory } from '../../domain/factories/store.factory.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';
import type { CreateStoreDto } from '../dto/create-store.dto.js';

@Injectable()
class CreateStoreUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly storeFactory: StoreFactory,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(dto: CreateStoreDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const stores = this.storeRepositoryFactory.create(transactionContext);

			const store = this.storeFactory.create(dto);
			return stores.create(store);
		});
	}
}

export { CreateStoreUseCase };
