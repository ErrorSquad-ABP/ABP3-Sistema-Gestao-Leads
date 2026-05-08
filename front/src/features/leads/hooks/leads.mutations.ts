import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	convertLead,
	createLead,
	deleteLead,
	reassignLead,
	updateLead,
} from '../api/leads.service';
import type {
	CreateLeadInput,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../model/leads.model';

function useCreateLeadMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateLeadInput) => createLead(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useUpdateLeadMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { leadId: string; payload: UpdateLeadInput }) =>
			updateLead(input.leadId, input.payload),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detail(variables.leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detailHub(variables.leadId),
			});
		},
	});
}

function useReassignLeadMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { leadId: string; payload: ReassignLeadInput }) =>
			reassignLead(input.leadId, input.payload),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detail(variables.leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detailHub(variables.leadId),
			});
		},
	});
}

function useConvertLeadMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (leadId: string) => convertLead(leadId),
		onSuccess: async (_data, leadId) => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detail(leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detailHub(leadId),
			});
		},
	});
}

function useDeleteLeadMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (leadId: string) => deleteLead(leadId),
		onSuccess: async (_data, leadId) => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detail(leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detailHub(leadId),
			});
		},
	});
}

export {
	useConvertLeadMutation,
	useCreateLeadMutation,
	useDeleteLeadMutation,
	useReassignLeadMutation,
	useUpdateLeadMutation,
};
