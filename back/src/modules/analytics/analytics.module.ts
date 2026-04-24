import { Module } from '@nestjs/common';

import { TemporalFilterPolicyService } from '../../shared/application/services/temporal-filter-policy.service.js';
import { UsersModule } from '../users/users.module.js';
import { GetAnalyticsDashboardUseCase } from './application/use-cases/get-analytics-dashboard.use-case.js';
import { AnalyticsDashboardPrismaQuery } from './infrastructure/queries/analytics-dashboard.prisma-query.js';
import { AnalyticsController } from './presentation/controllers/analytics.controller.js';

@Module({
	imports: [UsersModule],
	controllers: [AnalyticsController],
	providers: [
		TemporalFilterPolicyService,
		AnalyticsDashboardPrismaQuery,
		GetAnalyticsDashboardUseCase,
	],
	exports: [GetAnalyticsDashboardUseCase],
})
class AnalyticsModule {}

export { AnalyticsModule };
