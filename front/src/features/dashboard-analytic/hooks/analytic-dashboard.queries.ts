import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	getAnalyticDashboard,
	normalizeAnalyticDashboardQuery,
} from '../api/analytic-dashboard.service';
import type { AnalyticDashboardQuery } from '../model/analytic-dashboard.model';

function useAnalyticDashboardQuery(query: AnalyticDashboardQuery) {
	const normalizedQuery = normalizeAnalyticDashboardQuery(query);

	return useQuery({
		queryKey: queryKeys.dashboards.analytic(normalizedQuery),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			getAnalyticDashboard(normalizedQuery, signal),
	});
}

export { useAnalyticDashboardQuery };
