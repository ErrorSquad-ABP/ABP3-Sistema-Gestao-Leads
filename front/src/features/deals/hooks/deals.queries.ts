import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	findDeal,
	getDealsPipeline,
	getDealsPipelineStage,
	listDealHistory,
	listDealsByLead,
	listDealsPaged,
	type ListDealsQuery,
} from '../api/deals.service';
import type {
	DealPipelineQuery,
	DealPipelineResponse,
	DealStage,
} from '../model/deals.model';

function useDealsListQuery(query: ListDealsQuery) {
	return useQuery({
		queryKey: queryKeys.deals.list(query),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			listDealsPaged(query, signal),
	});
}

function useDealsPipelineQuery(query: DealPipelineQuery) {
	return useQuery({
		queryKey: queryKeys.deals.pipeline(query),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			getDealsPipeline(query, signal),
	});
}

function useLoadMorePipelineStageMutation(query: DealPipelineQuery) {
	const queryClient = useQueryClient();
	const pipelineQueryKey = queryKeys.deals.pipeline(query);

	return useMutation({
		mutationFn: (input: { stage: DealStage; page: number }) =>
			getDealsPipelineStage({
				...query,
				stage: input.stage,
				page: input.page,
			}),
		onSuccess: (nextStage) => {
			queryClient.setQueryData<DealPipelineResponse>(
				pipelineQueryKey,
				(current) => {
					if (!current) {
						return current;
					}
					return {
						stages: current.stages.map((stage) =>
							stage.key === nextStage.key
								? {
										...nextStage,
										items: [...stage.items, ...nextStage.items],
									}
								: stage,
						),
					};
				},
			);
		},
	});
}

type DealsByLeadQueryOptions = {
	/** Se `false`, a query não corre (ex.: diálogo fechado). */
	enabled?: boolean;
};

function useDealsByLeadQuery(
	leadId: string,
	options?: DealsByLeadQueryOptions,
) {
	const enabledByOption = options?.enabled !== false;
	return useQuery({
		queryKey: queryKeys.deals.byLead(leadId),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			listDealsByLead(leadId, signal),
		enabled: enabledByOption && Boolean(leadId),
	});
}

function useDealDetailQuery(dealId: string) {
	return useQuery({
		queryKey: queryKeys.deals.detail(dealId),
		queryFn: ({ signal }: { signal: AbortSignal }) => findDeal(dealId, signal),
		enabled: Boolean(dealId),
	});
}

type DealHistoryQueryOptions = {
	enabled?: boolean;
};

function useDealHistoryQuery(
	dealId: string,
	options?: DealHistoryQueryOptions,
) {
	const enabledByProp = options?.enabled !== false;
	return useQuery({
		queryKey: queryKeys.deals.history(dealId),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			listDealHistory(dealId, signal),
		enabled: enabledByProp && Boolean(dealId),
	});
}

export {
	useDealDetailQuery,
	useDealHistoryQuery,
	useDealsByLeadQuery,
	useDealsPipelineQuery,
	useDealsListQuery,
	useLoadMorePipelineStageMutation,
};
export type { DealsByLeadQueryOptions };
