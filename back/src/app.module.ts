import { Module } from '@nestjs/common';

import { HealthModule } from './modules/health/health.module.js';
import { SystemModule } from './modules/system/system.module.js';
import { PrismaModule } from './shared/infrastructure/database/prisma/prisma.module.js';
import { TransactionModule } from './shared/infrastructure/database/transaction/transaction.module.js';

@Module({
	imports: [PrismaModule, TransactionModule, HealthModule, SystemModule],
})
class AppModule {}

export { AppModule };
