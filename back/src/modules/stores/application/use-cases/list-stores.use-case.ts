import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { StoreRepositoryFactory } from '../../infrastructure/persistence/factories/store-repository.factory.js';

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
