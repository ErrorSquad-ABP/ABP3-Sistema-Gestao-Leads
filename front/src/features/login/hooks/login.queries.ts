import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { fetchCurrentUser } from '../api/login.service';

function useCurrentUserQuery() {
	return useQuery({
		queryKey: queryKeys.auth.currentUser,
		queryFn: ({ signal }) => fetchCurrentUser({ signal }),
	});
}

export { useCurrentUserQuery };
