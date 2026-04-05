const queryKeys = {
	customers: {
		all: ['customers'] as const,
	},
	leads: {
		all: ['leads'] as const,
		detail: (leadId: string) => ['leads', 'detail', leadId] as const,
		formDependencies: ['leads', 'form-dependencies'] as const,
		owner: (ownerUserId: string) => ['leads', 'owner', ownerUserId] as const,
		team: (teamId: string) => ['leads', 'team', teamId] as const,
	},
	stores: {
		all: ['stores'] as const,
	},
	users: {
		all: (page = 1, limit = 100) => ['users', page, limit] as const,
	},
} as const;

export { queryKeys };
