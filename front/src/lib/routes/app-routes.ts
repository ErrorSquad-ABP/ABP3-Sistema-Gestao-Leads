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
		profile: '/app/profile',
		users: '/app/users',
		dashboard: {
			operational: '/app/dashboard/operational',
			analytic: '/app/dashboard/analytic',
		},
	},
	system: {
		forbidden: '/403',
	},
} as const;

export { appRoutes };
