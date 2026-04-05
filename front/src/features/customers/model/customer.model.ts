import type { CustomerSummary } from '../types/customers.types';

function createCustomerLabel(customer: CustomerSummary) {
	return customer.email
		? `${customer.name} (${customer.email})`
		: customer.name;
}

export { createCustomerLabel };
