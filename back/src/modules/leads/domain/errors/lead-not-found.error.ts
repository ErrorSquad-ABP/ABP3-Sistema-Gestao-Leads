class LeadNotFoundError extends Error {
	readonly code = 'lead.not_found';

	constructor(leadId: string) {
		super(`Lead not found: ${leadId}`);
		this.name = 'LeadNotFoundError';
	}
}

export { LeadNotFoundError };
