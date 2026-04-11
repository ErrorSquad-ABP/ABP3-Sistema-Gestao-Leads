class CustomerNotFoundError extends Error {
	readonly code = 'customer.not_found';

	constructor(id: string) {
		super(`Customer not found with id: ${id}`);
		this.name = 'CustomerNotFoundError';
	}
}

export { CustomerNotFoundError };
