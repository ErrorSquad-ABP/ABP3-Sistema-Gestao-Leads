import { queryKeys } from '@/src/lib/constants/query-keys';

import { storesService } from '../api/stores.service';

const storesQueries = {
	all() {
		return {
			queryKey: queryKeys.stores.all,
			queryFn: () => storesService.list(),
		};
	},
};

export { storesQueries };
