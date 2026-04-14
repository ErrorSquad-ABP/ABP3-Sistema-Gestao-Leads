import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	createAccessGroup,
	createUser,
	deleteAccessGroup,
	deleteUser,
	updateAccessGroup,
	updateUser,
} from '../api/users.service';
import type {
	AccessGroup,
	CreateUserInput,
	UpdateUserInput,
} from '../types/users.types';

function useCreateUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateUserInput) => createUser(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
		},
	});
}

function useUpdateUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { userId: string; payload: UpdateUserInput }) =>
			updateUser(input.userId, input.payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.currentUser,
			});
		},
	});
}

function useDeleteUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) => deleteUser(userId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
		},
	});
}

function useCreateAccessGroupMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: Omit<AccessGroup, 'id' | 'isSystemGroup'>) =>
			createAccessGroup(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.users.accessGroups,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.currentUser,
			});
		},
	});
}

function useUpdateAccessGroupMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			groupId: string;
			payload: Partial<Omit<AccessGroup, 'id' | 'isSystemGroup'>>;
		}) => updateAccessGroup(input.groupId, input.payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.users.accessGroups,
			});
			await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.currentUser,
			});
		},
	});
}

function useDeleteAccessGroupMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (groupId: string) => deleteAccessGroup(groupId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.users.accessGroups,
			});
			await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.currentUser,
			});
		},
	});
}

export {
	useCreateAccessGroupMutation,
	useCreateUserMutation,
	useDeleteAccessGroupMutation,
	useDeleteUserMutation,
	useUpdateAccessGroupMutation,
	useUpdateUserMutation,
};
