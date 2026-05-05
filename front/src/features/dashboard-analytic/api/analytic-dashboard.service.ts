import { apiFetch } from '@/lib/http/api-client';

import type { AnalyticDashboardQuery } from '../model/analytic-dashboard.model';
import { parseAnalyticDashboardResponse } from '../schemas/analytic-dashboard.schema';

function normalizeAnalyticDashboardQuery(
	query: AnalyticDashboardQuery,
): AnalyticDashboardQuery {
	if (query.mode === 'custom') {
		return {
			mode: 'custom',
			startDate: query.startDate,
			endDate: query.endDate,
			top: query.top,
		};
	}

	return {
		mode: query.mode,
		referenceDate: query.referenceDate,
		top: query.top,
	};
}

function buildAnalyticDashboardQuery(query: AnalyticDashboardQuery) {
	const normalized = normalizeAnalyticDashboardQuery(query);
	const params = new URLSearchParams({
		mode: normalized.mode,
	});

	if (normalized.referenceDate) {
		params.set('referenceDate', normalized.referenceDate);
	}
	if (normalized.startDate) {
		params.set('startDate', normalized.startDate);
	}
	if (normalized.endDate) {
		params.set('endDate', normalized.endDate);
	}
	if (typeof normalized.top === 'number') {
		params.set('top', String(normalized.top));
	}

	return params.toString();
}

async function getAnalyticDashboard(
	query: AnalyticDashboardQuery,
	signal?: AbortSignal,
) {
	const normalized = normalizeAnalyticDashboardQuery(query);
	const queryString = buildAnalyticDashboardQuery(normalized);
	const raw = await apiFetch<unknown>(
		queryString
			? `/api/dashboards/analytic?${queryString}`
			: '/api/dashboards/analytic',
		{ signal },
	);

	return parseAnalyticDashboardResponse(raw);
}

export {
	buildAnalyticDashboardQuery,
	getAnalyticDashboard,
	normalizeAnalyticDashboardQuery,
};
