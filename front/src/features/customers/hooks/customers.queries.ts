import { useQuery } from '@tanstack/react-query';

import { useLeadCustomersQuery } from '@/features/leads/hooks/leads.catalog.queries';
import { queryKeys } from '@/lib/constants/query-keys';

import {
	listCustomerCatalog,
	type CustomerCatalogFilters,
} from '../api/customers.service';

function useCustomersQuery() {
	return useLeadCustomersQuery();
}

function useCustomerCatalogQuery(filters: CustomerCatalogFilters) {
	return useQuery({
		queryKey: queryKeys.customers.catalog(filters),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			listCustomerCatalog(filters, signal),
	});
}

export { useCustomerCatalogQuery, useCustomersQuery };
