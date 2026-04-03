class UserInvalidTeamError extends Error {
	readonly code = 'user.invalid_team';

	constructor(teamId: string) {
		super(`Team not found or invalid for user: ${teamId}`);
		this.name = 'UserInvalidTeamError';
	}
}

export { UserInvalidTeamError };
