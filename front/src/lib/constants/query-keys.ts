const queryKeys = {
	auth: {
		currentUser: ['auth', 'current-user'] as const,
	},
	/**
	 * Listagem de leads. Para invalidar após criar/editar (ex.: S1-FRONT-12):
	 * `queryClient.invalidateQueries({ queryKey: [...queryKeys.leads.listRoot] })`.
	 */
	leads: {
		/** Prefixo comum a todas as queries de listagem; adequado a `invalidateQueries`. */
		listRoot: ['leads', 'list'] as const,
		list: (params: { scope: 'owner' | 'team'; id: string }) =>
			['leads', 'list', params] as const,
		inactive: (userId: string) =>
			['leads', 'list', 'inactive', userId] as const,
	},
};

export { queryKeys };
