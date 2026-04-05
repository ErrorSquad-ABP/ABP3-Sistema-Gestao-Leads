import { Module } from '@nestjs/common';

import { ListStoresUseCase } from './application/use-cases/list-stores.use-case.js';
import { StoreRepositoryFactory } from './infrastructure/persistence/factories/store-repository.factory.js';
import { StoreController } from './presentation/controllers/store.controller.js';

@Module({
	controllers: [StoreController],
	providers: [StoreRepositoryFactory, ListStoresUseCase],
})
class StoresModule {}

export { StoresModule };
