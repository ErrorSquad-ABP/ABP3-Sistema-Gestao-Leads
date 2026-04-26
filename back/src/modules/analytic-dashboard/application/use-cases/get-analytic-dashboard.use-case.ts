import { Injectable } from '@nestjs/common';

import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import type { AnalyticDashboardRepositoryFactory } from '../../infrastructure/persistence/factories/analytic-dashboard-repository.factory.js';
import type { AnalyticsTimeMode } from '../../domain/repositories/analytic-dashboard.repository.js';
import type { AnalyticScopeService } from '../services/analytic-scope.service.js';
import type { AnalyticTimeRangeService } from '../services/analytic-time-range.service.js';

type GetAnalyticDashboardInput = {
	readonly mode: AnalyticsTimeMode;
	readonly referenceDate?: string;
	readonly startDate?: string;
	readonly endDate?: string;
};

@Injectable()
class GetAnalyticDashboardUseCase {
	constructor(
		private readonly analyticDashboardRepositoryFactory: AnalyticDashboardRepositoryFactory,
		private readonly analyticScopeService: AnalyticScopeService,
		private readonly analyticTimeRangeService: AnalyticTimeRangeService,
	) {}

	async execute(actor: LeadActor, input: GetAnalyticDashboardInput) {
		const timeRange = this.analyticTimeRangeService.resolve(input, actor.role);
		const scope = await this.analyticScopeService.resolve(actor);
		const repository = this.analyticDashboardRepositoryFactory.create();
		const dashboard = await repository.getAnalyticDashboard(scope, timeRange);

		return {
			filter: {
				mode: timeRange.mode,
				startDate: timeRange.startDate,
				endDate: timeRange.endDate,
				scope: scope.kind,
			},
			...dashboard,
		};
	}
}

export { GetAnalyticDashboardUseCase };
export type { GetAnalyticDashboardInput };
