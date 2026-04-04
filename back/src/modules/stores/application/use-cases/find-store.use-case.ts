import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';

@Injectable()
class FindStoreUseCase {
	constructor(
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute(storeId: string) {
		const stores = this.storeRepositoryFactory.create();
		const store = await stores.findById(Uuid.parse(storeId));
		if (!store) {
			throw new StoreNotFoundError(storeId);
		}
		return store;
	}
}

export { FindStoreUseCase };
