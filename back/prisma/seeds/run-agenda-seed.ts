import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../src/generated/prisma/client.js';
import { runAgendaDemoSeed } from './agenda-demo.seed.js';

const connectionString =
	process.env.DATABASE_URL ??
	'postgresql://abp:abp@localhost:5433/lead_management';

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

async function main() {
	console.log('Running agenda demo seed...');
	const summary = await runAgendaDemoSeed(prisma);
	console.log(
		`Agenda seed completed: ${summary.items} items for ${summary.users} users.`,
	);
}

main()
	.then(() => prisma.$disconnect())
	.catch((error) => {
		console.error(error);
		void prisma.$disconnect();
		process.exit(1);
	});
