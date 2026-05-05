import { Module } from '@nestjs/common';

import { LeadsModule } from '../leads/leads.module.js';
import { GetOperationalDashboardUseCase } from './application/use-cases/get-operational-dashboard.use-case.js';
import { OperationalDashboardRepositoryFactory } from './infrastructure/persistence/factories/operational-dashboard-repository.factory.js';
import { DashboardController } from './presentation/controllers/dashboard.controller.js';

@Module({
	imports: [LeadsModule],
	controllers: [DashboardController],
	providers: [
		OperationalDashboardRepositoryFactory,
		GetOperationalDashboardUseCase,
	],
})
class DashboardsModule {}

export { DashboardsModule };
