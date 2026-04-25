import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { LeadsModule } from '../leads/leads.module.js';
import { GetAnalyticDashboardUseCase } from './application/use-cases/get-analytic-dashboard.use-case.js';
import { AnalyticScopeService } from './application/services/analytic-scope.service.js';
import { AnalyticTimeRangeService } from './application/services/analytic-time-range.service.js';
import { AnalyticDashboardRepositoryFactory } from './infrastructure/persistence/factories/analytic-dashboard-repository.factory.js';
import { AnalyticDashboardController } from './presentation/controllers/analytic-dashboard.controller.js';

@Module({
	imports: [AuthModule, LeadsModule],
	controllers: [AnalyticDashboardController],
	providers: [
		AnalyticDashboardRepositoryFactory,
		AnalyticScopeService,
		AnalyticTimeRangeService,
		GetAnalyticDashboardUseCase,
	],
})
class DashboardsModule {}

export { DashboardsModule };
