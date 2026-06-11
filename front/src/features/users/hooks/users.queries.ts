import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { listAccessGroups, listUsers } from '../api/users.service';
import type { ListUsersFilters } from '../model/users.model';

function useUsersQuery(filters: ListUsersFilters) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.users.list(filters),
		queryFn: () => listUsers(filters),
	});
}

function useAccessGroupsQuery() {
	return useQuery({
		queryKey: queryKeys.users.accessGroups,
		queryFn: () => listAccessGroups(),
	});
}

export { useAccessGroupsQuery, useUsersQuery };
