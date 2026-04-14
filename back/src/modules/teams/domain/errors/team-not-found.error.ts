class TeamNotFoundError extends Error {
	readonly code = 'team.not_found';

	constructor(teamId: string) {
		super(`Team with id "${teamId}" was not found`);
		this.name = TeamNotFoundError.name;
	}
}

export { TeamNotFoundError };
