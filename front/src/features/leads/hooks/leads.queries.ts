import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { queryKeys } from '@/lib/constants/query-keys';

import { fetchLeadsByOwner, fetchLeadsByTeam } from '../api/leads.service';
import type { LeadListItem } from '../types/leads.types';

type LeadsListScope =
	| { kind: 'owner'; id: string }
	| { kind: 'team'; id: string }
	| { kind: 'none'; reason: 'no_team' };

/**
 * Define qual endpoint de listagem usar.
 * - ATTENDANT: sempre por owner (`user.id`).
 * - MANAGER / ADMINISTRATOR: por team se `teamId` existir; caso contrário `none` (sem endpoint global na API).
 * S1-FRONT-12/14: manter coerência ao adicionar criar lead ou escopo por papel.
 */
function resolveLeadsListScope(user: AuthenticatedUser): LeadsListScope | null {
	if (user.role === 'ATTENDANT') {
		return { kind: 'owner', id: user.id };
	}
	if (user.role === 'MANAGER' || user.role === 'ADMINISTRATOR') {
		if (user.teamId) {
			return { kind: 'team', id: user.teamId };
		}
		return { kind: 'none', reason: 'no_team' };
	}
	return null;
}

function isLeadsListQueryEnabled(scope: LeadsListScope | null) {
	return scope !== null && scope.kind !== 'none';
}

function buildLeadsListQueryKey(user: AuthenticatedUser) {
	const s = resolveLeadsListScope(user);
	if (!s || s.kind === 'none') {
		return queryKeys.leads.inactive(user.id);
	}
	return queryKeys.leads.list({ scope: s.kind, id: s.id });
}

type UseLeadsListQueryResult = UseQueryResult<LeadListItem[]> & {
	scope: LeadsListScope | null;
};

function useLeadsListQuery(user: AuthenticatedUser): UseLeadsListQueryResult {
	const scope = useMemo(() => resolveLeadsListScope(user), [user]);
	const enabled = isLeadsListQueryEnabled(scope);
	const queryKey = useMemo(() => {
		if (!scope || scope.kind === 'none') {
			return queryKeys.leads.inactive(user.id);
		}
		return queryKeys.leads.list({ scope: scope.kind, id: scope.id });
	}, [user.id, scope]);

	const query = useQuery<LeadListItem[]>({
		queryKey,
		queryFn: ({ signal }: { signal: AbortSignal }) => {
			if (scope?.kind === 'owner') {
				return fetchLeadsByOwner(scope.id, signal);
			}
			if (scope?.kind === 'team') {
				return fetchLeadsByTeam(scope.id, signal);
			}
			return Promise.resolve([]);
		},
		enabled,
	});

	return { ...query, scope };
}

export {
	buildLeadsListQueryKey,
	isLeadsListQueryEnabled,
	resolveLeadsListScope,
	useLeadsListQuery,
};
