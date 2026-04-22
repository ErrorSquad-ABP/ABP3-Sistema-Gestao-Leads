import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	createDealForLead,
	deleteDeal,
	updateDeal,
} from '../api/deals.service';
import type { DealCreateInput, DealUpdateInput } from '../model/deals.model';

function useCreateDealForLeadMutation(leadId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: DealCreateInput) => createDealForLead(leadId, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.byLead(leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.vehicles.listRoot,
			});
		},
	});
}

function useUpdateDealMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { dealId: string; payload: DealUpdateInput }) =>
			updateDeal(input.dealId, input.payload),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.detail(variables.dealId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.history(variables.dealId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.vehicles.listRoot,
			});
		},
	});
}

function useDeleteDealMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (dealId: string) => deleteDeal(dealId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.vehicles.listRoot,
			});
		},
	});
}

export {
	useCreateDealForLeadMutation,
	useDeleteDealMutation,
	useUpdateDealMutation,
};
