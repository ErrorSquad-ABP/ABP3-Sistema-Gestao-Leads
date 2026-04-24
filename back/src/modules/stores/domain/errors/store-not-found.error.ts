class StoreNotFoundError extends Error {
	readonly code = 'store.not_found';

	constructor(storeId: string) {
		super(`Store not found: ${storeId}`);
		this.name = 'StoreNotFoundError';
	}
}

export { StoreNotFoundError };
