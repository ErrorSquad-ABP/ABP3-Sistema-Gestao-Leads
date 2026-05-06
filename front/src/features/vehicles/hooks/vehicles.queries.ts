import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	findVehicle,
	listVehicleCatalog,
	listVehicles,
	type ListVehiclesFilters,
	type VehicleCatalogFilters,
} from '../api/vehicles.service';

function useVehiclesListQuery(
	filters: ListVehiclesFilters,
	options?: { readonly enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.vehicles.list(filters),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			listVehicles(filters, signal),
		enabled: options?.enabled,
	});
}

function useVehicleCatalogQuery(
	filters: VehicleCatalogFilters,
	options?: { readonly enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.vehicles.catalog(filters),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			listVehicleCatalog(filters, signal),
		enabled: options?.enabled,
	});
}

function useVehicleByIdQuery(
	vehicleId: string,
	options?: { readonly enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.vehicles.detail(vehicleId),
		queryFn: ({ signal }) => findVehicle(vehicleId, signal),
		enabled: Boolean(vehicleId) && (options?.enabled ?? true),
	});
}

export { useVehicleByIdQuery, useVehicleCatalogQuery, useVehiclesListQuery };
