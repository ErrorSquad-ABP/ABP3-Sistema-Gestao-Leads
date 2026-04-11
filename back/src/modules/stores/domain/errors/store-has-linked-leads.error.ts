class StoreHasLinkedLeadsError extends Error {
	readonly code = 'store.has_linked_leads';

	constructor(storeId: string) {
		super(
			`Store with id "${storeId}" cannot be deleted because it has linked leads`,
		);
		this.name = StoreHasLinkedLeadsError.name;
	}
}

export { StoreHasLinkedLeadsError };
