import { useLeadCustomersQuery } from '@/features/leads/hooks/leads.catalog.queries';

function useCustomersQuery() {
	return useLeadCustomersQuery();
}

export { useCustomersQuery };
