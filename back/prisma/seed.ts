import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
import { buildDashboardCsvSeed } from './seeds/dashboard-csv.seed.js';
import { buildMinimalSeed } from './seeds/minimal.seed.js';

const connectionString =
	process.env.DATABASE_URL ??
	'postgresql://abp:abp@localhost:5433/lead_management';

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

/** `minimal` (padrão): auth + dados mestres. `dashboard`: CSV fictício completo (leads, clientes, etc.). */
const seedMode = (process.env.SEED_MODE ?? 'minimal').toLowerCase();

export async function runSeed() {
	console.log(`Running seed (SEED_MODE=${seedMode})...`);

	if (seedMode === 'dashboard') {
		const dataset = await buildDashboardCsvSeed();

		await prisma.auditLog.deleteMany();
		await prisma.deal.deleteMany();
		await prisma.lead.deleteMany();
		await prisma.customer.deleteMany();
		await prisma.user.deleteMany();
		await prisma.accessGroup.deleteMany();
		await prisma.store.deleteMany();
		await prisma.team.deleteMany();

		await prisma.accessGroup.createMany({ data: dataset.accessGroups });
		await prisma.team.createMany({ data: dataset.teams });
		await prisma.store.createMany({ data: dataset.stores });
		await prisma.user.createMany({ data: dataset.users });
		await prisma.customer.createMany({ data: dataset.customers });
		await prisma.lead.createMany({ data: dataset.leads });
		await prisma.deal.createMany({ data: dataset.deals });

		console.log(
			`Seeded ${dataset.accessGroups.length} access groups, ${dataset.teams.length} teams, ${dataset.stores.length} stores, ${dataset.users.length} users, ${dataset.customers.length} customers, ${dataset.leads.length} leads and ${dataset.deals.length} deals from dashboard CSV.`,
		);
	} else if (seedMode === 'minimal') {
		const dataset = await buildMinimalSeed();

		await prisma.auditLog.deleteMany();
		await prisma.deal.deleteMany();
		await prisma.lead.deleteMany();
		await prisma.customer.deleteMany();
		await prisma.user.deleteMany();
		await prisma.accessGroup.deleteMany();
		await prisma.store.deleteMany();
		await prisma.team.deleteMany();

		await prisma.accessGroup.createMany({ data: dataset.accessGroups });
		await prisma.team.createMany({ data: dataset.teams });
		await prisma.store.createMany({ data: dataset.stores });
		await prisma.user.createMany({ data: dataset.users });

		console.log(
			`Seeded minimal dataset: ${dataset.accessGroups.length} access groups, ${dataset.teams.length} teams, ${dataset.stores.length} stores, ${dataset.users.length} users (SEED_DEFAULT_PASSWORD / admin123).`,
		);
	} else {
		throw new Error(
			`Invalid SEED_MODE="${seedMode}". Use "minimal" or "dashboard".`,
		);
	}

	console.log('Seed completed.');
}

runSeed()
	.then(() => prisma.$disconnect())
	.catch((error) => {
		console.error(error);
		void prisma.$disconnect();
		process.exit(1);
	});
