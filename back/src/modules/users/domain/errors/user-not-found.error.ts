class UserNotFoundError extends Error {
	readonly code = 'user.not_found';

	constructor(userId: string) {
		super(`User not found: ${userId}`);
		this.name = 'UserNotFoundError';
	}
}

export { UserNotFoundError };
