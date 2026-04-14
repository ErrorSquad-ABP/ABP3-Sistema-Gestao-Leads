class TeamInvalidStoreError extends Error {
	readonly code = 'team.invalid_store';

	constructor(storeId: string) {
		super(`Store with id "${storeId}" was not found for team linkage`);
		this.name = TeamInvalidStoreError.name;
	}
}

export { TeamInvalidStoreError };
