import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { getOperationalDashboard } from '../api/operational-dashboard.service';
import type { OperationalDashboardQueryInput } from '../model/operational-dashboard.model';

function useOperationalDashboardQuery(
	query: OperationalDashboardQueryInput = {},
) {
	return useQuery({
		queryKey: queryKeys.dashboards.operational(query),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			getOperationalDashboard(query, signal),
	});
}

export { useOperationalDashboardQuery };
