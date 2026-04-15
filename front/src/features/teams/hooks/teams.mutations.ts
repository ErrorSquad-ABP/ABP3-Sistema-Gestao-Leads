import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	assignTeamManager,
	createTeam,
	deleteTeam,
	updateTeam,
} from '../api/teams.service';
import type { TeamMutationInput, TeamUpdateInput } from '../types/teams.types';

function useCreateTeamMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: TeamMutationInput) => createTeam(body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.leads.teams });
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useUpdateTeamMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { id: string; body: TeamUpdateInput }) =>
			updateTeam(params.id, params.body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.leads.teams });
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useDeleteTeamMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (teamId: string) => deleteTeam(teamId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.leads.teams });
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useAssignTeamManagerMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { id: string; managerId: string | null }) =>
			assignTeamManager(params.id, params.managerId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.leads.teams });
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

export {
	useAssignTeamManagerMutation,
	useCreateTeamMutation,
	useDeleteTeamMutation,
	useUpdateTeamMutation,
};
