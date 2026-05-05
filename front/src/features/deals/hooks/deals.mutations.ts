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
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.pipelineRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.byLead(leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.vehicles.listRoot,
			});
			if (variables.vehicleId) {
				await queryClient.invalidateQueries({
					queryKey: queryKeys.vehicles.detail(variables.vehicleId),
				});
			}
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

function useUpdateDealMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { dealId: string; payload: DealUpdateInput }) =>
			updateDeal(input.dealId, input.payload),
		onSuccess: async (data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.pipelineRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.detail(variables.dealId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.history(variables.dealId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.byLead(data.leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.vehicles.listRoot,
			});
			if (data.vehicleId) {
				await queryClient.invalidateQueries({
					queryKey: queryKeys.vehicles.detail(data.vehicleId),
				});
			}
			if (variables.payload.vehicleId) {
				await queryClient.invalidateQueries({
					queryKey: queryKeys.vehicles.detail(variables.payload.vehicleId),
				});
			}
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detail(data.leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.detailHub(data.leadId),
			});
		},
	});
}

function useDeleteDealMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ dealId }: { dealId: string; leadId: string }) =>
			deleteDeal(dealId),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.listRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.pipelineRoot,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.deals.byLead(variables.leadId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.vehicles.listRoot,
			});
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

export {
	useCreateDealForLeadMutation,
	useDeleteDealMutation,
	useUpdateDealMutation,
};
