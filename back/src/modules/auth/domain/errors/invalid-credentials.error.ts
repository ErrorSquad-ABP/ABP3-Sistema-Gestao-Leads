class InvalidCredentialsError extends Error {
	readonly code = 'auth.invalid_credentials';

	constructor() {
		super('Credenciais inválidas.');
		this.name = 'InvalidCredentialsError';
	}
}

export { InvalidCredentialsError };
