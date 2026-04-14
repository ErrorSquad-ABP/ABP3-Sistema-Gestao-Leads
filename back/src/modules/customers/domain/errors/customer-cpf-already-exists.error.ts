class CustomerCpfAlreadyExistsError extends Error {
	readonly code = 'customer.cpf_already_exists';

	constructor(cpf: string) {
		super(`Customer CPF already exists: ${cpf}`);
		this.name = 'CustomerCpfAlreadyExistsError';
	}
}

export { CustomerCpfAlreadyExistsError };
