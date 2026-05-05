import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthConfigModule } from './config/auth-config.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { DashboardsModule } from './modules/dashboards/dashboards.module.js';
import { DealsModule } from './modules/deals/deals.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { SystemModule } from './modules/system/system.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { StoresModule } from './modules/stores/stores.module.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { PrismaModule } from './shared/infrastructure/database/prisma/prisma.module.js';
import { TransactionModule } from './shared/infrastructure/database/transaction/transaction.module.js';
import { GlobalAuthGuard } from './shared/presentation/guards/global-auth.guard.js';

@Module({
	imports: [
		AuthConfigModule,
		PrismaModule,
		TransactionModule,
		SystemModule,
		UsersModule,
		AuthModule,
		CustomersModule,
		DashboardsModule,
		DealsModule,
		LeadsModule,
		VehiclesModule,
		StoresModule,
		TeamsModule,
	],
	providers: [
		GlobalAuthGuard,
		{ provide: APP_GUARD, useClass: GlobalAuthGuard },
	],
})
class AppModule {}

export { AppModule };
