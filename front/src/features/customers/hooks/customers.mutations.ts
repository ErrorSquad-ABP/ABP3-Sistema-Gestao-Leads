import {
	useCreateCustomerMutation as useCreateCustomerCatalogMutation,
	useDeleteCustomerMutation as useDeleteCustomerCatalogMutation,
	useUpdateCustomerMutation as useUpdateCustomerCatalogMutation,
} from '@/features/leads/hooks/leads.catalog.mutations';

function useCreateCustomerMutation() {
	return useCreateCustomerCatalogMutation();
}

function useUpdateCustomerMutation() {
	return useUpdateCustomerCatalogMutation();
}

function useDeleteCustomerMutation() {
	return useDeleteCustomerCatalogMutation();
}

export {
	useCreateCustomerMutation,
	useDeleteCustomerMutation,
	useUpdateCustomerMutation,
};
