const appRoutes = {
	root: '/',
	auth: {
		forgotPassword: '/forgot-password',
		login: '/login',
		register: '/register',
	},
	app: {
		root: '/app',
		customers: '/app/customers',
		leads: '/app/leads',
		stores: '/app/stores',
		teams: '/app/teams',
		operations: '/app/operations',
		profile: '/app/profile',
		users: '/app/users',
		dashboard: {
			operational: '/app/dashboard/operational',
			analytic: '/app/dashboard/analytic',
		},
	},
	system: {
		unauthorized: '/401',
		forbidden: '/403',
	},
} as const;

export { appRoutes };
