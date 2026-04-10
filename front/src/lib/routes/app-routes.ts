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
