import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { listTeamMemberCandidates, listTeams } from '../api/teams.service';

function useTeamsQuery() {
	return useQuery({
		queryKey: queryKeys.leads.teams,
		queryFn: ({ signal }) => listTeams(signal),
	});
}

function useTeamMemberCandidatesQuery(storeId?: string) {
	return useQuery({
		enabled: Boolean(storeId),
		queryKey: ['teams', 'member-candidates', storeId ?? 'no-store'],
		queryFn: ({ signal }) => listTeamMemberCandidates(storeId, signal),
	});
}

export { useTeamMemberCandidatesQuery, useTeamsQuery };
