import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { queryKeys } from '@/lib/constants/query-keys';

import {
	fetchLeadsAll,
	fetchLeadsByOwner,
	fetchLeadsByTeam,
} from '../api/leads.service';
import {
	type LeadsListScope,
	mergeLeadListsById,
	resolveLeadsListScope,
} from '../lib/leads-scope';
import type { LeadListItem } from '../types/leads.types';

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
	if (s.kind === 'teams') {
		return queryKeys.leads.listMultiTeam(user.id, s.ids);
	}
	return queryKeys.leads.list({ scope: 'owner', id: s.id });
}

type UseLeadsListQueryResult = {
	scope: LeadsListScope | null;
	data: LeadListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
	isSuccess: boolean;
	error: unknown;
	refetch: () => Promise<void>;
};

function useLeadsListQuery(user: AuthenticatedUser): UseLeadsListQueryResult {
	const scope = useMemo(() => resolveLeadsListScope(user), [user]);

	const singleEnabled =
		scope !== null &&
		scope.kind !== 'none' &&
		scope.kind !== 'teams';

	const singleQuery = useQuery({
		queryKey:
			scope?.kind === 'owner'
				? queryKeys.leads.list({ scope: 'owner', id: scope.id })
				: scope?.kind === 'all'
					? queryKeys.leads.list({ scope: 'all' })
					: queryKeys.leads.inactive(user.id),
		queryFn: ({ signal }: { signal: AbortSignal }) => {
			if (scope?.kind === 'owner') {
				return fetchLeadsByOwner(scope.id, signal);
			}
			if (scope?.kind === 'all') {
				return fetchLeadsAll(signal);
			}
			return Promise.resolve([]);
		},
		enabled: singleEnabled,
	});

	const teamQueries = useQueries({
		queries:
			scope?.kind === 'teams'
				? scope.ids.map((teamId) => ({
						queryKey: queryKeys.leads.list({ scope: 'team', id: teamId }),
						queryFn: ({ signal }: { signal: AbortSignal }) =>
							fetchLeadsByTeam(teamId, signal),
					}))
				: [],
	});

	if (scope?.kind === 'teams') {
		const isPending = teamQueries.some((q) => q.isPending);
		const isError = teamQueries.some((q) => q.isError);
		const err = teamQueries.find((q) => q.error)?.error;
		const isSuccess =
			teamQueries.length > 0 && teamQueries.every((q) => q.isSuccess);
		const data = mergeLeadListsById(teamQueries.map((q) => q.data ?? []));
		return {
			scope,
			data: isSuccess ? data : undefined,
			isPending,
			isError,
			isSuccess,
			error: err ?? null,
			refetch: async () => {
				await Promise.all(teamQueries.map((q) => q.refetch()));
			},
		};
	}

	return {
		scope,
		data: singleQuery.data,
		isPending: singleQuery.isPending,
		isError: singleQuery.isError,
		isSuccess: singleQuery.isSuccess,
		error: singleQuery.error,
		refetch: async () => {
			await singleQuery.refetch();
		},
	};
}

export {
	buildLeadsListQueryKey,
	isLeadsListQueryEnabled,
	resolveLeadsListScope,
	useLeadsListQuery,
};
