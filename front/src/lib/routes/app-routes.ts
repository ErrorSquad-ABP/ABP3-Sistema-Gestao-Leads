const appRoutes = {
	root: '/',
	auth: {
		forgotPassword: '/forgot-password',
		login: '/login',
		register: '/register',
	},
	app: {
		root: '/app',
		leads: '/app/leads',
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
