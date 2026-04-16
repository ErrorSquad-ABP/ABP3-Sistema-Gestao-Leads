class ActiveDealAlreadyExistsError extends Error {
	readonly code = 'deal.active_already_exists';

	constructor(leadId: string) {
		super(`Este lead já possui uma negociação aberta: ${leadId}`);
		this.name = 'ActiveDealAlreadyExistsError';
	}
}

export { ActiveDealAlreadyExistsError };
