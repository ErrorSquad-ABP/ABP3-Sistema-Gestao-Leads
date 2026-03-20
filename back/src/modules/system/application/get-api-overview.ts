import { env } from '../../../shared/config/env';

function getApiOverview() {
	return {
		name: 'Sistema de Gestão de Leads com Dashboard Analítico',
		status: 'bootstrapped',
		repositoryStrategy: 'single-repository',
		solutionStyle: 'separate-next-apps',
		backendPattern: 'modular-monolith',
		transport: 'http-json',
		appUrl: env.appUrl,
		nodeEnv: env.nodeEnv,
		infrastructure: {
			databaseConfigured: env.hasDatabaseUrl,
			jwtConfigured: env.hasJwtSecret,
		},
		modules: [
			'auth',
			'users',
			'teams',
			'stores',
			'customers',
			'leads',
			'negotiations',
			'dashboards',
			'audit-logs',
		],
		endpoints: {
			health: '/api/health',
			v1: '/api/v1',
		},
	};
}

export { getApiOverview };
