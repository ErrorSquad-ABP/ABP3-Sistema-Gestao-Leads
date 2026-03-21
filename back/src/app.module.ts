import { Module } from '@nestjs/common';

import { HealthModule } from './modules/health/health.module.js';
import { SystemModule } from './modules/system/system.module.js';

@Module({
	imports: [HealthModule, SystemModule],
})
class AppModule {}

export { AppModule };
