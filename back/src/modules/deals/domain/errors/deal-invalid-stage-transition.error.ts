class DealInvalidStageTransitionError extends Error {
	readonly code = 'deal.invalid_stage_transition';

	constructor(message: string) {
		super(message);
		this.name = 'DealInvalidStageTransitionError';
	}
}

export { DealInvalidStageTransitionError };
