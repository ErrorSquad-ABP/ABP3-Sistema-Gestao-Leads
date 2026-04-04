class TeamInvalidManagerError extends Error {
	readonly code = 'team.invalid_manager';

	constructor(managerId: string) {
		super(`Manager with id "${managerId}" was not found`);
		this.name = TeamInvalidManagerError.name;
	}
}

export { TeamInvalidManagerError };
