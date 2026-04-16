export {
	createCustomer,
	deleteCustomer,
	listLeadCustomers as listCustomers,
	updateCustomer,
} from '@/features/leads/api/leads.service';

export type {
	CreateCustomerBody as CustomerMutationInput,
	UpdateCustomerBody,
} from '@/features/leads/api/leads.service';
