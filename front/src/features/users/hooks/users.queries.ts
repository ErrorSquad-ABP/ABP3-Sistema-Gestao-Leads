import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { listAccessGroups, listUsers } from '../api/users.service';

function useUsersQuery(page: number, limit: number) {
	return useQuery({
		queryKey: queryKeys.users.list(page, limit),
		queryFn: () =>
			listUsers({
				page,
				limit,
			}),
	});
}

function useAccessGroupsQuery() {
	return useQuery({
		queryKey: queryKeys.users.accessGroups,
		queryFn: () => listAccessGroups(),
	});
}

export { useAccessGroupsQuery, useUsersQuery };
