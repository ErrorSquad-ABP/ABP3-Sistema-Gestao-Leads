import { queryKeys } from '@/src/lib/constants/query-keys';

import { usersService, type ListUsersOptions } from '../api/users.service';

const usersQueries = {
	all(options?: ListUsersOptions) {
		const page = options?.page ?? 1;
		const limit = options?.limit ?? 100;

		return {
			queryKey: queryKeys.users.all(page, limit),
			queryFn: () => usersService.list({ page, limit }),
		};
	},
};

export { usersQueries };
