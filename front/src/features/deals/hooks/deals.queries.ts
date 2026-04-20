import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	findDeal,
	listDealHistory,
	listDealsByLead,
	listDealsPaged,
	type ListDealsQuery,
} from '../api/deals.service';

function useDealsListQuery(query: ListDealsQuery) {
	return useQuery({
		queryKey: queryKeys.deals.list(query),
		queryFn: ({ signal }: { signal: AbortSignal }) => listDealsPaged(query, signal),
	});
}

function useDealsByLeadQuery(leadId: string) {
	return useQuery({
		queryKey: queryKeys.deals.byLead(leadId),
		queryFn: ({ signal }: { signal: AbortSignal }) => listDealsByLead(leadId, signal),
		enabled: Boolean(leadId),
	});
}

function useDealDetailQuery(dealId: string) {
	return useQuery({
		queryKey: queryKeys.deals.detail(dealId),
		queryFn: ({ signal }: { signal: AbortSignal }) => findDeal(dealId, signal),
		enabled: Boolean(dealId),
	});
}

function useDealHistoryQuery(dealId: string) {
	return useQuery({
		queryKey: queryKeys.deals.history(dealId),
		queryFn: ({ signal }: { signal: AbortSignal }) => listDealHistory(dealId, signal),
		enabled: Boolean(dealId),
	});
}

export {
	useDealDetailQuery,
	useDealHistoryQuery,
	useDealsByLeadQuery,
	useDealsListQuery,
};

