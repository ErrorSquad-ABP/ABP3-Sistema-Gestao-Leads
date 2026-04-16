import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { queryKeys } from '@/lib/constants/query-keys';

import {
	fetchLeadsAll,
	fetchLeadsByOwner,
	fetchLeadsManager,
} from '../api/leads.service';
import { type LeadsListScope, resolveLeadsListScope } from '../lib/leads-scope';
import type { LeadListItem } from '../model/leads.model';

function isLeadsListQueryEnabled(scope: LeadsListScope | null) {
	return scope !== null && scope.kind !== 'none';
}

function buildLeadsListQueryKey(user: AuthenticatedUser, page: number) {
	const s = resolveLeadsListScope(user);
	if (!s || s.kind === 'none') {
		return queryKeys.leads.inactive(user.id);
	}
	if (s.kind === 'all') {
		return queryKeys.leads.list({ scope: 'all', page });
	}
	if (s.kind === 'manager') {
		return queryKeys.leads.list({ scope: 'manager', page });
	}
	return queryKeys.leads.list({ scope: 'owner', id: s.id, page });
}

type UseLeadsListQueryResult = {
	scope: ReturnType<typeof resolveLeadsListScope> | null;
	data: LeadListItem[] | undefined;
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	isPending: boolean;
	isError: boolean;
	isSuccess: boolean;
	error: unknown;
	refetch: () => Promise<void>;
};

function useLeadsListQuery(
	user: AuthenticatedUser,
	page: number,
): UseLeadsListQueryResult {
	const scope = useMemo(() => resolveLeadsListScope(user), [user]);

	const enabled = scope !== null && scope.kind !== 'none';

	const listQuery = useQuery({
		queryKey:
			scope?.kind === 'owner'
				? queryKeys.leads.list({ scope: 'owner', id: scope.id, page })
				: scope?.kind === 'all'
					? queryKeys.leads.list({ scope: 'all', page })
					: scope?.kind === 'manager'
						? queryKeys.leads.list({ scope: 'manager', page })
						: queryKeys.leads.inactive(user.id),
		queryFn: ({ signal }: { signal: AbortSignal }) => {
			if (scope?.kind === 'owner') {
				return fetchLeadsByOwner(scope.id, page, signal);
			}
			if (scope?.kind === 'all') {
				return fetchLeadsAll(page, signal);
			}
			if (scope?.kind === 'manager') {
				return fetchLeadsManager(page, signal);
			}
			return Promise.resolve({
				items: [],
				page: 1,
				limit: 10,
				total: 0,
				totalPages: 0,
			});
		},
		enabled,
	});

	const paged = listQuery.data;

	return {
		scope,
		data: paged?.items,
		page: paged?.page ?? page,
		limit: paged?.limit ?? 10,
		total: paged?.total ?? 0,
		totalPages: paged?.totalPages ?? 0,
		isPending: listQuery.isPending,
		isError: listQuery.isError,
		isSuccess: listQuery.isSuccess,
		error: listQuery.error,
		refetch: async () => {
			await listQuery.refetch();
		},
	};
}

export {
	buildLeadsListQueryKey,
	isLeadsListQueryEnabled,
	resolveLeadsListScope,
	useLeadsListQuery,
};
