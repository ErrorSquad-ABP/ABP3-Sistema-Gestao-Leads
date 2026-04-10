class CustomerEmailAlreadyExistsError extends Error {
	readonly code = 'customer.email_already_exists';

	constructor(email: string) {
		super(`Customer email already exists: ${email}`);
		this.name = 'CustomerEmailAlreadyExistsError';
	}
}

export { CustomerEmailAlreadyExistsError };
