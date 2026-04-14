const queryKeys = {
	auth: {
		currentUser: ['auth', 'current-user'] as const,
	},
	users: {
		all: ['users'] as const,
		list: (page: number, limit: number) =>
			['users', 'list', page, limit] as const,
		accessGroups: ['users', 'access-groups'] as const,
	},
	/**
	 * Listagem de leads. Para invalidar após criar/editar (ex.: S1-FRONT-12):
	 * `queryClient.invalidateQueries({ queryKey: [...queryKeys.leads.listRoot] })`.
	 */
	leads: {
		/** Prefixo comum a todas as queries de listagem; adequado a `invalidateQueries`. */
		listRoot: ['leads', 'list'] as const,
		list: (
			params:
				| { scope: 'owner'; id: string }
				| { scope: 'team'; id: string }
				| { scope: 'all' },
		) =>
			params.scope === 'all'
				? (['leads', 'list', 'all'] as const)
				: (['leads', 'list', params.scope, params.id] as const),
		inactive: (userId: string) =>
			['leads', 'list', 'inactive', userId] as const,
	},
};

export { queryKeys };
