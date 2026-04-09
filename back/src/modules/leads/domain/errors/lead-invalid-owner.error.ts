class LeadInvalidOwnerError extends Error {
	readonly code = 'lead.invalid_owner';

	constructor(ownerUserId: string) {
		super(`Invalid lead owner: ${ownerUserId}`);
		this.name = 'LeadInvalidOwnerError';
	}
}

export { LeadInvalidOwnerError };
