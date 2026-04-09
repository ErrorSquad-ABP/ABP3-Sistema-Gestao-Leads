class LeadInvalidStoreError extends Error {
	readonly code = 'lead.invalid_store';

	constructor(storeId: string) {
		super(`Invalid lead store: ${storeId}`);
		this.name = 'LeadInvalidStoreError';
	}
}

export { LeadInvalidStoreError };
