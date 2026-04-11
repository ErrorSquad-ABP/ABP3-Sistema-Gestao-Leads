class TeamInvalidManagerError extends Error {
	readonly code = 'team.invalid_manager';

	constructor(managerId: string) {
		super(
			`Manager with id "${managerId}" was not found or does not have a compatible role`,
		);
		this.name = TeamInvalidManagerError.name;
	}
}

export { TeamInvalidManagerError };
