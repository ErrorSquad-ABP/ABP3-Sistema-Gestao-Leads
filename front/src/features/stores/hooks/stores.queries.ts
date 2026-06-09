import { useLeadStoresQuery } from '@/features/leads/hooks/leads.catalog.queries';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { listStoreMetrics } from '../api/stores.service';

function useStoresQuery() {
	return useLeadStoresQuery();
}

function useStoreMetricsQuery() {
	return useQuery({
		queryKey: queryKeys.stores.metrics,
		queryFn: ({ signal }) => listStoreMetrics(signal),
	});
}

export { useStoreMetricsQuery, useStoresQuery };
