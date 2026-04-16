class DealNotFoundError extends Error {
	readonly code = 'deal.not_found';

	constructor(dealId: string) {
		super(`Deal not found: ${dealId}`);
		this.name = 'DealNotFoundError';
	}
}

export { DealNotFoundError };
