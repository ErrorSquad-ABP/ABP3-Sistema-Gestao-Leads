import { Global, Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';

import { UnitOfWork } from './unit-of-work.js';

@Global()
@Module({
	imports: [PrismaModule],
	providers: [UnitOfWork],
	exports: [UnitOfWork],
})
class TransactionModule {}

export { TransactionModule };
