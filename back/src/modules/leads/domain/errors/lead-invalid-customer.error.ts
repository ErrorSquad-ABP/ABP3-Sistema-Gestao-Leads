class LeadInvalidCustomerError extends Error {
	readonly code = 'lead.invalid_customer';

	constructor(customerId: string) {
		super(`Invalid lead customer: ${customerId}`);
		this.name = 'LeadInvalidCustomerError';
	}
}

export { LeadInvalidCustomerError };
