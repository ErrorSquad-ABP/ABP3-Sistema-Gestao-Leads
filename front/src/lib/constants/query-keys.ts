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
};

export { queryKeys };
