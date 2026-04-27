import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IAnalyticDashboardRepository } from '../../../domain/repositories/analytic-dashboard.repository.js';
import { AnalyticDashboardPrismaRepository } from '../repositories/analytic-dashboard-prisma.repository.js';

@Injectable()
class AnalyticDashboardRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(): IAnalyticDashboardRepository {
		return new AnalyticDashboardPrismaRepository(this.prisma);
	}
}

export { AnalyticDashboardRepositoryFactory };
