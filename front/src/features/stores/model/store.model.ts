import type { StoreSummary } from '../types/stores.types';

function createStoreLabel(store: StoreSummary) {
	return store.name;
}

export { createStoreLabel };
