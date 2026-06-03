import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	cancelAgendaItem,
	completeAgendaItem,
	createAgendaItem,
	getAgendaItems,
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

function useCreateAgendaItemMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateAgendaItemPayload) => createAgendaItem(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.itemsRoot });
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
		},
	});
}

function useCompleteAgendaItemMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => completeAgendaItem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.itemsRoot });
		},
	});
}

function useCancelAgendaItemMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => cancelAgendaItem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.agenda.itemsRoot });
		},
	});
}

export {
	useAgendaItemsQuery,
	useCancelAgendaItemMutation,
	useCompleteAgendaItemMutation,
	useCreateAgendaItemMutation,
	useUpdateAgendaItemMutation,
};
