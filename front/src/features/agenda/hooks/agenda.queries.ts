import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	cancelAgendaItem,
	completeAgendaItem,
	createAgendaItem,
	deleteAgendaItem,
	getAgendaMetrics,
	getAgendaItems,
	getLeadAgendaItems,
	updateAgendaItem,
} from '../api/agenda.service';
import type {
	AgendaItemsQuery,
	CreateAgendaItemPayload,
	UpdateAgendaItemPayload,
} from '../model/agenda.model';

function useAgendaItemsQuery(
	query: AgendaItemsQuery = {},
	options: { enabled?: boolean } = {},
) {
	return useQuery({
		queryKey: queryKeys.agenda.items(query),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			getAgendaItems(query, signal),
		enabled: options.enabled ?? true,
	});
}

function useAgendaMetricsQuery() {
	return useQuery({
		queryKey: queryKeys.agenda.metrics,
		queryFn: ({ signal }: { signal: AbortSignal }) => getAgendaMetrics(signal),
	});
}

function useLeadAgendaItemsQuery(
	leadId: string,
	options?: { readonly enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.agenda.leadItems(leadId),
		queryFn: ({ signal }: { signal: AbortSignal }) =>
			getLeadAgendaItems(leadId, signal),
		enabled: options?.enabled,
	});
}

function useCreateAgendaItemMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateAgendaItemPayload) => createAgendaItem(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.itemsRoot });
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.metrics });
			queryClient.invalidateQueries({
				queryKey: queryKeys.agenda.leadItemsRoot,
			});
		},
	});
}

function useUpdateAgendaItemMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateAgendaItemPayload;
		}) => updateAgendaItem(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.itemsRoot });
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.metrics });
			queryClient.invalidateQueries({
				queryKey: queryKeys.agenda.leadItemsRoot,
			});
		},
	});
}

function useCompleteAgendaItemMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => completeAgendaItem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.itemsRoot });
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.metrics });
			queryClient.invalidateQueries({
				queryKey: queryKeys.agenda.leadItemsRoot,
			});
		},
	});
}

function useCancelAgendaItemMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => cancelAgendaItem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.itemsRoot });
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.metrics });
			queryClient.invalidateQueries({
				queryKey: queryKeys.agenda.leadItemsRoot,
			});
		},
	});
}

function useDeleteAgendaItemMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteAgendaItem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.itemsRoot });
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.metrics });
			queryClient.invalidateQueries({
				queryKey: queryKeys.agenda.leadItemsRoot,
			});
		},
	});
}

export {
	useAgendaItemsQuery,
	useAgendaMetricsQuery,
	useCancelAgendaItemMutation,
	useCompleteAgendaItemMutation,
	useCreateAgendaItemMutation,
	useDeleteAgendaItemMutation,
	useLeadAgendaItemsQuery,
	useUpdateAgendaItemMutation,
};
