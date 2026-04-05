import { apiClient } from '@/src/lib/http/api-client';

import { parseUsersPage } from '../schemas/user.schema';

type ListUsersOptions = {
	readonly page?: number;
	readonly limit?: number;
};

const usersResource = apiClient.createHttpResource('/users');

const usersService = {
	list(options?: ListUsersOptions) {
		return usersResource.list(parseUsersPage, {
			page: options?.page ?? 1,
			limit: options?.limit ?? 100,
		});
	},
};

export type { ListUsersOptions };
export { usersService };
