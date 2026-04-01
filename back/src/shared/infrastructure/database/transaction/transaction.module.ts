import { Global, Module } from '@nestjs/common';

import { UNIT_OF_WORK } from '../../../application/contracts/unit-of-work.js';
import { PrismaModule } from '../prisma/prisma.module.js';

import { UnitOfWork } from './unit-of-work.js';

@Global()
@Module({
	imports: [PrismaModule],
	providers: [
		UnitOfWork,
		{
			provide: UNIT_OF_WORK,
			useExisting: UnitOfWork,
		},
	],
	exports: [UNIT_OF_WORK],
})
class TransactionModule {}

export { TransactionModule };
