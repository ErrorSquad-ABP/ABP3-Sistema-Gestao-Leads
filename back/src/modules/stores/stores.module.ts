import { Module } from '@nestjs/common';

import { LeadsModule } from '../leads/leads.module.js';
import { CreateStoreUseCase } from './application/use-cases/create-store.use-case.js';
import { DeleteStoreUseCase } from './application/use-cases/delete-store.use-case.js';
import { FindStoreUseCase } from './application/use-cases/find-store.use-case.js';
import { ListStoreMetricsUseCase } from './application/use-cases/list-store-metrics.use-case.js';
import { ListStoresUseCase } from './application/use-cases/list-stores.use-case.js';
import { UpdateStoreUseCase } from './application/use-cases/update-store.use-case.js';
import { StoreFactory } from './domain/factories/store.factory.js';
import { StoreRepositoryFactory } from './infrastructure/persistence/factories/store-repository.factory.js';
import { StoreController } from './presentation/controllers/store.controller.js';

@Module({
	imports: [LeadsModule],
	controllers: [StoreController],
	providers: [
		StoreFactory,
		StoreRepositoryFactory,
		CreateStoreUseCase,
		UpdateStoreUseCase,
		FindStoreUseCase,
		ListStoresUseCase,
		ListStoreMetricsUseCase,
		DeleteStoreUseCase,
	],
})
class StoresModule {}

export { StoresModule };
