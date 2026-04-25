import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { getAnalyticDashboard } from '../api/analytic-dashboard.service';
import type { AnalyticDashboardQuery } from '../model/analytic-dashboard.model';

function useAnalyticDashboardQuery(query: AnalyticDashboardQuery) {
	return useQuery({
		queryKey: queryKeys.dashboards.analytic(query),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			getAnalyticDashboard(query, signal),
	});
}

export { useAnalyticDashboardQuery };
