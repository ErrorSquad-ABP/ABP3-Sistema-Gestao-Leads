import type { Express, Request, Response } from 'express';

import { getHealth } from '../../modules/health/health.controller.js';

function registerRoutes(app: Express) {
	app.get('/health', getHealth);

	app.get('/api/v1', (_request: Request, response: Response) => {
		response.json({
			name: 'Sistema de Gestão de Leads com Dashboard Analítico',
			status: 'bootstrapped',
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
		});
	});
}

export { registerRoutes };
