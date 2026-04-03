class UserEmailAlreadyExistsError extends Error {
	readonly code = 'user.email_already_exists';

	constructor(email: string) {
		super(`User email already exists: ${email}`);
		this.name = 'UserEmailAlreadyExistsError';
	}
}

export { UserEmailAlreadyExistsError };
