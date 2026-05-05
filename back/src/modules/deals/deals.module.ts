import { Module } from '@nestjs/common';

import { LeadsModule } from '../leads/leads.module.js';
import { VehiclesModule } from '../vehicles/vehicles.module.js';
import { CreateDealUseCase } from './application/use-cases/create-deal.use-case.js';
import { DeleteDealUseCase } from './application/use-cases/delete-deal.use-case.js';
import { FindDealUseCase } from './application/use-cases/find-deal.use-case.js';
import { ListDealHistoryUseCase } from './application/use-cases/list-deal-history.use-case.js';
import { ListDealPipelineUseCase } from './application/use-cases/list-deal-pipeline.use-case.js';
import { ListDealsUseCase } from './application/use-cases/list-deals.use-case.js';
import { ListDealsByLeadUseCase } from './application/use-cases/list-deals-by-lead.use-case.js';
import { UpdateDealUseCase } from './application/use-cases/update-deal.use-case.js';
import { DealFactory } from './domain/factories/deal.factory.js';
import { DealHistoryRepositoryFactory } from './infrastructure/persistence/factories/deal-history-repository.factory.js';
import { DealRepositoryFactory } from './infrastructure/persistence/factories/deal-repository.factory.js';
import { DealController } from './presentation/controllers/deal.controller.js';

@Module({
	imports: [LeadsModule, VehiclesModule],
	controllers: [DealController],
	providers: [
		DealFactory,
		DealRepositoryFactory,
		DealHistoryRepositoryFactory,
		CreateDealUseCase,
		UpdateDealUseCase,
		FindDealUseCase,
		ListDealsUseCase,
		ListDealPipelineUseCase,
		ListDealsByLeadUseCase,
		ListDealHistoryUseCase,
		DeleteDealUseCase,
	],
})
class DealsModule {}

export { DealsModule };
