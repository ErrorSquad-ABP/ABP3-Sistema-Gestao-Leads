import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthConfigModule } from './config/auth-config.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { SystemModule } from './modules/system/system.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './shared/infrastructure/database/prisma/prisma.module.js';
import { TransactionModule } from './shared/infrastructure/database/transaction/transaction.module.js';
import { GlobalAuthGuard } from './shared/presentation/guards/global-auth.guard.js';

@Module({
	imports: [
		AuthConfigModule,
		PrismaModule,
		TransactionModule,
		AnalyticsModule,
		SystemModule,
		UsersModule,
		AuthModule,
		LeadsModule,
	],
	providers: [
		GlobalAuthGuard,
		{ provide: APP_GUARD, useClass: GlobalAuthGuard },
	],
})
class AppModule {}

export { AppModule };
