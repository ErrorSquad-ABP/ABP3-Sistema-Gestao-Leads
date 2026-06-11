import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
import { runDemoSeed } from './seeds/demo-dataset.seed.js';

const connectionString =
	process.env.DATABASE_URL ??
	'postgresql://abp:abp@localhost:5433/lead_management';

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

const DEFAULT_SEED_PASSWORD_LABEL = ['admin', '123'].join('');

export async function runSeed() {
	console.log(
		'Running demo seed (4 users, 5 teams, 100 operational records by default)...',
	);
	console.log(
		`Login: admin@crm.com / geral@crm.com / gerente@crm.com / atendente@crm.com — password SEED_DEFAULT_PASSWORD or ${DEFAULT_SEED_PASSWORD_LABEL}`,
	);

	await runDemoSeed(prisma);

	console.log('Seed completed.');
}

runSeed()
	.then(() => prisma.$disconnect())
	.catch((error) => {
		console.error(error);
		void prisma.$disconnect();
		process.exit(1);
	});
