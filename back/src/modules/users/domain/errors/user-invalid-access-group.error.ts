class UserInvalidAccessGroupError extends Error {
	readonly code = 'user.invalid_access_group';

	constructor(accessGroupId: string) {
		super(`Access group not found or invalid for user: ${accessGroupId}`);
		this.name = 'UserInvalidAccessGroupError';
	}
}

export { UserInvalidAccessGroupError };
