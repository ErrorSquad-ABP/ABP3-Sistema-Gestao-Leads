class DealAlreadyClosedError extends Error {
	readonly code = 'deal.already_closed';

	constructor(dealId: string) {
		super(`Negociação encerrada; não é possível alterar: ${dealId}`);
		this.name = 'DealAlreadyClosedError';
	}
}

export { DealAlreadyClosedError };
