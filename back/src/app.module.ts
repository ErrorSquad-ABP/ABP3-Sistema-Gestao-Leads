import { Module } from '@nestjs/common';

import { LeadsModule } from './modules/leads/leads.module.js';
import { SystemModule } from './modules/system/system.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './shared/infrastructure/database/prisma/prisma.module.js';
import { TransactionModule } from './shared/infrastructure/database/transaction/transaction.module.js';

@Module({
	imports: [
		PrismaModule,
		TransactionModule,
		SystemModule,
		UsersModule,
		LeadsModule,
	],
})
class AppModule {}

export { AppModule };
