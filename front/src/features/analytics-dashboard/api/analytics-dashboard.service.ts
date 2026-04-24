import { apiFetch } from '@/lib/http/api-client';

import { analyticsDashboardSchema } from '../schemas/analytics-dashboard.schema';
import type {
	AnalyticsDashboard,
	AnalyticsDashboardFilter,
} from '../types/analytics-dashboard.types';

function buildAnalyticsDashboardQueryString(filter: AnalyticsDashboardFilter) {
	const params = new URLSearchParams({
		period: filter.period,
	});

	if (filter.period === 'custom') {
		params.set('startDate', filter.startDate);
		params.set('endDate', filter.endDate);
	} else {
		params.set('referenceDate', filter.referenceDate);
	}

	return params.toString();
}

async function getAnalyticsDashboard(filter: AnalyticsDashboardFilter) {
	const query = buildAnalyticsDashboardQueryString(filter);
	const payload = await apiFetch<AnalyticsDashboard>(
		`/api/analytics/dashboard?${query}`,
	);

	return analyticsDashboardSchema.parse(payload);
}

export { buildAnalyticsDashboardQueryString, getAnalyticsDashboard };
