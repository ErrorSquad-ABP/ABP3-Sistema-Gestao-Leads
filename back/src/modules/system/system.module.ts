import { Module } from '@nestjs/common';

import { GetSystemSummaryUseCase } from './application/use-cases/get-system-summary.use-case.js';
import { HealthController } from './presentation/controllers/health.controller.js';
import { SystemController } from './presentation/controllers/system.controller.js';

@Module({
	controllers: [SystemController, HealthController],
	providers: [GetSystemSummaryUseCase],
})
class SystemModule {}

export { SystemModule };
