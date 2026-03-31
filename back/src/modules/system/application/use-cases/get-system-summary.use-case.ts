import { Injectable } from '@nestjs/common';

import { env } from '../../../../config/env.js';
import type { SystemSummary } from '../../domain/entities/system-summary.entity.js';

@Injectable()
class GetSystemSummaryUseCase {
	execute(): SystemSummary {
		return {
			appUrl: env.appUrl,
			backendPattern: 'modular-monolith',
			endpoints: {
				docs: '/docs',
				health: '/api/health',
				v1: '/api/v1',
			},
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
			name: 'Sistema de Gestão de Leads com Dashboard Analítico',
			nodeEnv: env.nodeEnv,
			repositoryStrategy: 'single-repository',
			solutionStyle: 'next-front-nest-back',
			status: 'bootstrapped',
			transport: 'http-json',
		};
	}
}

export { GetSystemSummaryUseCase };
