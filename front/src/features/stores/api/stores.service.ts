import { apiClient } from '@/src/lib/http/api-client';

import { parseStoreList } from '../schemas/store.schema';

const storesResource = apiClient.createHttpResource('/stores');

const storesService = {
	list() {
		return storesResource.list(parseStoreList);
	},
};

export { storesService };
