import { queryKeys } from '@/src/lib/constants/query-keys';

import { customersService } from '../api/customers.service';

const customersQueries = {
	all() {
		return {
			queryKey: queryKeys.customers.all,
			queryFn: () => customersService.list(),
		};
	},
};

export { customersQueries };
