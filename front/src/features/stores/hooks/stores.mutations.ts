import {
	useCreateStoreMutation as useCreateStoreCatalogMutation,
	useDeleteStoreMutation as useDeleteStoreCatalogMutation,
	useUpdateStoreMutation as useUpdateStoreCatalogMutation,
} from '@/features/leads/hooks/leads.catalog.mutations';

function useCreateStoreMutation() {
	return useCreateStoreCatalogMutation();
}

function useUpdateStoreMutation() {
	return useUpdateStoreCatalogMutation();
}

function useDeleteStoreMutation() {
	return useDeleteStoreCatalogMutation();
}

export {
	useCreateStoreMutation,
	useDeleteStoreMutation,
	useUpdateStoreMutation,
};
