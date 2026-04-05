import { Injectable } from '@nestjs/common';

import type { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';

@Injectable()
class ListStoresUseCase {
	constructor(
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	execute() {
		const stores = this.storeRepositoryFactory.create();
		return stores.list();
	}
}

export { ListStoresUseCase };
