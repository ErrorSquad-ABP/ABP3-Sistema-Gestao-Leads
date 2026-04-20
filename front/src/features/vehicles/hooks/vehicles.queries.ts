import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { listVehicles, type ListVehiclesFilters } from '../api/vehicles.service';

function useVehiclesListQuery(
	filters: ListVehiclesFilters,
	options?: { readonly enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.vehicles.list(filters),
		queryFn: ({ signal }: { signal: AbortSignal }) => listVehicles(filters, signal),
		enabled: options?.enabled,
	});
}

export { useVehiclesListQuery };

