import { Module } from '@nestjs/common';

import { GetHealthUseCase } from './application/use-cases/get-health.use-case.js';
import { HealthController } from './presentation/controllers/health.controller.js';

@Module({
	controllers: [HealthController],
	providers: [GetHealthUseCase],
})
class HealthModule {}

export { HealthModule };
