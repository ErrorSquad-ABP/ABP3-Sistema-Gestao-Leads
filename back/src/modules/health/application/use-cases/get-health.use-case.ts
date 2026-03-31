import { Injectable } from '@nestjs/common';

import type { PrismaService } from '../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { HealthSnapshot } from '../../domain/entities/health-snapshot.js';

@Injectable()
class GetHealthUseCase {
	constructor(private readonly prismaService: PrismaService) {}

	async execute(): Promise<HealthSnapshot> {
		await this.prismaService.assertConnection();

		return {
			database: 'ok',
			runtime: 'nest',
			service: 'back',
			status: 'ok',
			timestamp: new Date().toISOString(),
			transport: 'http-json',
		};
	}
}

export { GetHealthUseCase };
