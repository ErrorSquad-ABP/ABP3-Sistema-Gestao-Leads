import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '../../../../config/env.js';
import { PrismaClient } from '../../../../generated/prisma/client.js';

@Injectable()
class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor() {
		const connectionString = env.databaseUrl;

		if (!connectionString) {
			throw new Error('DATABASE_URL is required to initialize Prisma');
		}

		super({
			adapter: new PrismaPg({ connectionString }),
		});
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}

	async assertConnection() {
		await this.$queryRaw`SELECT 1`;
	}
}

export { PrismaService };
