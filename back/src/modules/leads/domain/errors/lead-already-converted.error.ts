class LeadAlreadyConvertedError extends Error {
	readonly code = 'lead.already_converted';

	constructor(leadId: string) {
		super(`Lead is already converted: ${leadId}`);
		this.name = 'LeadAlreadyConvertedError';
	}
}

export { LeadAlreadyConvertedError };
