import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { listTeams } from '../api/teams.service';

function useTeamsQuery() {
	return useQuery({
		queryKey: queryKeys.leads.teams,
		queryFn: ({ signal }) => listTeams(signal),
	});
}

export { useTeamsQuery };
