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
		catalogRoot: ['leads', 'catalog'] as const,
		detail: (leadId: string) => ['leads', 'detail', leadId] as const,
		detailHub: (leadId: string) => ['leads', 'detail-hub', leadId] as const,
		list: (
			params:
				| { scope: 'owner'; id: string; page: number }
				| { scope: 'team'; id: string; page: number }
				| { scope: 'all'; page: number }
				| { scope: 'manager'; page: number },
		) =>
			params.scope === 'all'
				? (['leads', 'list', 'all', params.page] as const)
				: params.scope === 'manager'
					? (['leads', 'list', 'manager', params.page] as const)
					: (['leads', 'list', params.scope, params.id, params.page] as const),
		inactive: (userId: string) =>
			['leads', 'list', 'inactive', userId] as const,
		customers: ['leads', 'catalog', 'customers'] as const,
		stores: ['leads', 'catalog', 'stores'] as const,
		teams: ['leads', 'catalog', 'teams'] as const,
		owners: ['leads', 'catalog', 'owners'] as const,
	},
	vehicles: {
		listRoot: ['vehicles', 'list'] as const,
		list: (params: {
			storeId?: string;
			status?: string;
			withoutOpenDeal?: boolean;
		}) =>
			[
				'vehicles',
				'list',
				params.storeId ?? 'all-stores',
				params.status ?? 'all-statuses',
				params.withoutOpenDeal ? 'without-open-deal' : 'all-deals',
			] as const,
		detail: (vehicleId: string) => ['vehicles', 'detail', vehicleId] as const,
	},
	deals: {
		listRoot: ['deals', 'list'] as const,
		pipelineRoot: ['deals', 'pipeline'] as const,
		/**
		 * Lista de negociações por lead (`useDealsByLeadQuery`). Após mutação,
		 * invalidar com `queryKeys.deals.byLead(leadId)`.
		 */
		byLead: (leadId: string) => ['deals', 'by-lead', leadId] as const,
		detail: (dealId: string) => ['deals', 'detail', dealId] as const,
		history: (dealId: string) => ['deals', 'history', dealId] as const,
		list: (params: {
			storeId?: string;
			ownerUserId?: string;
			status?: string;
			page: number;
			limit: number;
		}) =>
			[
				'deals',
				'list',
				params.storeId ?? 'all-stores',
				params.ownerUserId ?? 'all-owners',
				params.status ?? 'all-statuses',
				params.page,
				params.limit,
			] as const,
		pipeline: (params: {
			status?: string;
			importance?: string;
			search?: string;
			pageSize: number;
			valueSort?: string;
		}) =>
			[
				'deals',
				'pipeline',
				params.status ?? 'all-statuses',
				params.importance ?? 'all-importances',
				params.search?.trim() ?? '',
				params.pageSize,
				params.valueSort ?? 'recent',
			] as const,
		pipelineStage: (params: {
			stage: string;
			status?: string;
			importance?: string;
			search?: string;
			page: number;
			pageSize: number;
			valueSort?: string;
		}) =>
			[
				'deals',
				'pipeline-stage',
				params.stage,
				params.status ?? 'all-statuses',
				params.importance ?? 'all-importances',
				params.search?.trim() ?? '',
				params.page,
				params.pageSize,
				params.valueSort ?? 'recent',
			] as const,
	},
	dashboards: {
		operational: (params: { startDate?: string; endDate?: string } = {}) =>
			[
				'dashboards',
				'operational',
				params.startDate ?? 'default',
				params.endDate ?? 'default',
			] as const,
	},
	dashboards: {
		analytic: (params: {
			mode: string;
			referenceDate?: string;
			startDate?: string;
			endDate?: string;
		}) =>
			[
				'dashboards',
				'analytic',
				params.mode,
				params.referenceDate ?? 'no-reference-date',
				params.startDate ?? 'no-start-date',
				params.endDate ?? 'no-end-date',
			] as const,
	},
};

export { queryKeys };
