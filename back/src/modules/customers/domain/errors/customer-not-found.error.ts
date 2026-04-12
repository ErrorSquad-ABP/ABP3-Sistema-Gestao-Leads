class CustomerNotFoundError extends Error {
	readonly code = 'customer.not_found';

	constructor(customerId: string) {
		super(`Customer not found: ${customerId}`);
		this.name = 'CustomerNotFoundError';
	}
}

export { CustomerNotFoundError };
