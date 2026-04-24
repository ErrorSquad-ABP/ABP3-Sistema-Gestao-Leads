import { Module } from '@nestjs/common';

import { TemporalFilterPolicyService } from '../../shared/application/services/temporal-filter-policy.service.js';
import { GetAnalyticsDashboardUseCase } from './application/use-cases/get-analytics-dashboard.use-case.js';
import { AnalyticsDashboardPrismaQuery } from './infrastructure/queries/analytics-dashboard.prisma-query.js';

@Module({
	providers: [
		TemporalFilterPolicyService,
		AnalyticsDashboardPrismaQuery,
		GetAnalyticsDashboardUseCase,
	],
	exports: [GetAnalyticsDashboardUseCase],
})
class AnalyticsModule {}

export { AnalyticsModule };
