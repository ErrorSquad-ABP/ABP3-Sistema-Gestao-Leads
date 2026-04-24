import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import type {
	CreateCustomerBody,
	CreateStoreBody,
	UpdateCustomerBody,
	UpdateStoreBody,
} from '../api/leads.service';
import {
	createCustomer,
	createStore,
	deleteCustomer,
	deleteStore,
	updateCustomer,
	updateStore,
} from '../api/leads.service';

function useCreateCustomerMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreateCustomerBody) => createCustomer(body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.customers,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useUpdateCustomerMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { id: string; body: UpdateCustomerBody }) =>
			updateCustomer(params.id, params.body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.customers,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useDeleteCustomerMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteCustomer(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.customers,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useCreateStoreMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreateStoreBody) => createStore(body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.stores,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.owners,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useUpdateStoreMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { id: string; body: UpdateStoreBody }) =>
			updateStore(params.id, params.body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.stores,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.owners,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

function useDeleteStoreMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteStore(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.stores,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.leads.owners,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.leads.listRoot,
			});
		},
	});
}

export {
	useCreateCustomerMutation,
	useCreateStoreMutation,
	useDeleteCustomerMutation,
	useDeleteStoreMutation,
	useUpdateCustomerMutation,
	useUpdateStoreMutation,
};
