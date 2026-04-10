const appRoutes = {
	root: '/',
	auth: {
		forgotPassword: '/forgot-password',
		login: '/login',
		register: '/register',
	},
	app: {
		leads: '/app/leads',
		dashboard: {
			operational: '/app/dashboard/operational',
			analytic: '/app/dashboard/analytic',
		},
	},
} as const;

export { appRoutes };
