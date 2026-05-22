import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	listLeadCustomers,
	listLeadOwners,
	listLeadStores,
} from '../api/leads.service';

function useLeadCustomersQuery() {
	return useQuery({
		queryKey: queryKeys.leads.customers,
		queryFn: ({ signal }) => listLeadCustomers(signal),
	});
}

function useLeadStoresQuery() {
	return useQuery({
		queryKey: queryKeys.leads.stores,
		queryFn: ({ signal }) => listLeadStores(signal),
	});
}

function useLeadOwnersQuery() {
	return useQuery({
		queryKey: queryKeys.leads.owners,
		queryFn: ({ signal }) => listLeadOwners(signal),
	});
}

export { useLeadCustomersQuery, useLeadOwnersQuery, useLeadStoresQuery };
