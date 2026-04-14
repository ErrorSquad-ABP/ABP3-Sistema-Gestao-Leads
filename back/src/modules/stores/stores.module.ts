import { Module } from '@nestjs/common';

import { CreateStoreUseCase } from './application/use-cases/create-store.use-case.js';
import { DeleteStoreUseCase } from './application/use-cases/delete-store.use-case.js';
import { FindStoreUseCase } from './application/use-cases/find-store.use-case.js';
import { ListStoresUseCase } from './application/use-cases/list-stores.use-case.js';
import { UpdateStoreUseCase } from './application/use-cases/update-store.use-case.js';
import { StoreFactory } from './domain/factories/store.factory.js';
import { StoreRepositoryFactory } from './infrastructure/persistence/factories/store-repository.factory.js';
import { StoreController } from './presentation/controllers/store.controller.js';

@Module({
	controllers: [StoreController],
	providers: [
		StoreFactory,
		StoreRepositoryFactory,
		CreateStoreUseCase,
		UpdateStoreUseCase,
		FindStoreUseCase,
		ListStoresUseCase,
		DeleteStoreUseCase,
	],
})
class StoresModule {}

export { StoresModule };
