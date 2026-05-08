import { apiFetch } from '@/lib/http/api-client';

import type { OperationalDashboardQueryInput } from '../model/operational-dashboard.model';
import { parseOperationalDashboardResponse } from '../schemas/operational-dashboard.schema';

function buildOperationalDashboardQuery(input: OperationalDashboardQueryInput) {
	const params = new URLSearchParams();
	if (input.startDate && input.endDate) {
		params.set('startDate', input.startDate);
		params.set('endDate', input.endDate);
	}
	return params.toString();
}

async function getOperationalDashboard(
	input: OperationalDashboardQueryInput = {},
	signal?: AbortSignal,
) {
	const query = buildOperationalDashboardQuery(input);
	const raw = await apiFetch<unknown>(
		`/api/dashboards/operational${query ? `?${query}` : ''}`,
		{
			signal,
		},
	);
	return parseOperationalDashboardResponse(raw);
}

export { getOperationalDashboard };
