import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { queryKeys } from '@/lib/constants/query-keys';

import {
	fetchLeadsAll,
	fetchLeadsByOwner,
	fetchLeadsByTeam,
} from '../api/leads.service';
import type { LeadListItem } from '../types/leads.types';

type LeadsListScope =
	| { kind: 'owner'; id: string }
	| { kind: 'team'; id: string }
	| { kind: 'all' }
	| { kind: 'none'; reason: 'no_team' };

/**
 * Define qual endpoint de listagem usar (alinhado ao `lead-list-access` e rotas no back).
 * - ATTENDANT: por owner (`user.id`).
 * - MANAGER / GENERAL_MANAGER: por equipa se `teamId` existir; senão `none`.
 * - ADMINISTRATOR: por equipa se `teamId` existir; senão listagem global (`GET /api/leads/all`).
 */
function resolveLeadsListScope(user: AuthenticatedUser): LeadsListScope | null {
	if (user.role === 'ATTENDANT') {
		return { kind: 'owner', id: user.id };
	}
	if (user.role === 'MANAGER' || user.role === 'GENERAL_MANAGER') {
		if (user.teamId) {
			return { kind: 'team', id: user.teamId };
		}
		return { kind: 'none', reason: 'no_team' };
	}
	if (user.role === 'ADMINISTRATOR') {
		if (user.teamId) {
			return { kind: 'team', id: user.teamId };
		}
		return { kind: 'all' };
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
	if (s.kind === 'all') {
		return queryKeys.leads.list({ scope: 'all' });
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
		if (scope.kind === 'all') {
			return queryKeys.leads.list({ scope: 'all' });
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
			if (scope?.kind === 'all') {
				return fetchLeadsAll(signal);
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
