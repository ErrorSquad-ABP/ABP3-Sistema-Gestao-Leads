import { Injectable } from '@nestjs/common';

import type { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';

@Injectable()
class ListStoreMetricsUseCase {
	constructor(
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
	) {}

	async execute() {
		const stores = this.storeRepositoryFactory.create();
		return stores.listMetrics();
	}
}

export { ListStoreMetricsUseCase };
