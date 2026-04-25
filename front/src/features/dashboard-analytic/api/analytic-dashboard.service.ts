import { apiFetch } from '@/lib/http/api-client';

import type { AnalyticDashboardQuery } from '../model/analytic-dashboard.model';
import { parseAnalyticDashboardResponse } from '../schemas/analytic-dashboard.schema';

function buildAnalyticDashboardQuery(query: AnalyticDashboardQuery) {
	const params = new URLSearchParams({
		mode: query.mode,
	});

	if (query.referenceDate) {
		params.set('referenceDate', query.referenceDate);
	}
	if (query.startDate) {
		params.set('startDate', query.startDate);
	}
	if (query.endDate) {
		params.set('endDate', query.endDate);
	}

	return params.toString();
}

async function getAnalyticDashboard(
	query: AnalyticDashboardQuery,
	signal?: AbortSignal,
) {
	const raw = await apiFetch<unknown>(
		`/api/dashboards/analytic?${buildAnalyticDashboardQuery(query)}`,
		{ signal },
	);

	return parseAnalyticDashboardResponse(raw);
}

export { getAnalyticDashboard };
