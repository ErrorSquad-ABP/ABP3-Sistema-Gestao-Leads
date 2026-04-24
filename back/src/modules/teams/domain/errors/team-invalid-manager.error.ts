class TeamInvalidManagerError extends Error {
	readonly code = 'team.invalid_manager';

	constructor(managerId: string) {
		super(
			`User "${managerId}" cannot be assigned as team manager: role must be MANAGER, GENERAL_MANAGER, or ADMINISTRATOR`,
		);
		this.name = TeamInvalidManagerError.name;
	}
}

export { TeamInvalidManagerError };
