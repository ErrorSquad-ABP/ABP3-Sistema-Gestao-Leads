import { apiFetch } from '@/lib/http/api-client';

import { parseStoreMetricsResponse } from '../schemas/store-metrics.schema';

export {
	createStore,
	deleteStore,
	listLeadStores as listStores,
	updateStore,
} from '@/features/leads/api/leads.service';

export type {
	CreateStoreBody as StoreMutationInput,
	UpdateStoreBody,
} from '@/features/leads/api/leads.service';

async function listStoreMetrics(signal?: AbortSignal) {
	const raw = await apiFetch<unknown>('/api/stores/metrics', { signal });
	return parseStoreMetricsResponse(raw);
}

export { listStoreMetrics };
