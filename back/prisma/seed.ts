import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { type Prisma, PrismaClient } from '../src/generated/prisma/client.js';
import { buildDashboardCsvSeed } from './seeds/dashboard-csv.seed.js';
import { buildMinimalSeed } from './seeds/minimal.seed.js';
import type { SeedTeam } from './seeds/seed-definitions.js';

const connectionString =
	process.env.DATABASE_URL ??
	'postgresql://abp:abp@localhost:5433/lead_management';

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

/** `minimal` (padrão): auth + dados mestres. `dashboard`: CSV fictício completo (leads, clientes, etc.). */
const seedMode = (process.env.SEED_MODE ?? 'minimal').toLowerCase();
const SEED_TRANSACTION_OPTIONS = {
	maxWait: 10_000,
	timeout: 30_000,
} as const;

async function truncateSeedData(tx: Prisma.TransactionClient) {
	await tx.auditLog.deleteMany();
	await tx.deal.deleteMany();
	await tx.lead.deleteMany();
	await tx.customer.deleteMany();
	await tx.authSession.deleteMany();
	await tx.team.deleteMany();
	await tx.user.deleteMany();
	await tx.accessGroup.deleteMany();
	await tx.store.deleteMany();
}

async function createTeams(tx: Prisma.TransactionClient, teams: SeedTeam[]) {
	for (const team of teams) {
		await tx.team.create({
			data: {
				id: team.id,
				name: team.name,
				storeId: team.storeId,
				managerId: team.managerId,
				members:
					team.memberIds.length > 0
						? {
								connect: team.memberIds.map((id) => ({ id })),
							}
						: undefined,
			},
		});
	}
}

export async function runSeed() {
	console.log(`Running seed (SEED_MODE=${seedMode})...`);

	if (seedMode === 'dashboard') {
		const dataset = await buildDashboardCsvSeed();

		await prisma.$transaction(async (tx) => {
			await truncateSeedData(tx);
			await tx.accessGroup.createMany({ data: dataset.accessGroups });
			await tx.store.createMany({ data: dataset.stores });
			await tx.user.createMany({ data: dataset.users });
			await createTeams(tx, dataset.teams);
			await tx.customer.createMany({ data: dataset.customers });
			await tx.lead.createMany({ data: dataset.leads });
			await tx.deal.createMany({ data: dataset.deals });
		}, SEED_TRANSACTION_OPTIONS);

		console.log(
			`Seeded ${dataset.accessGroups.length} access groups, ${dataset.teams.length} teams, ${dataset.stores.length} stores, ${dataset.users.length} users, ${dataset.customers.length} customers, ${dataset.leads.length} leads and ${dataset.deals.length} deals from dashboard CSV.`,
		);
	} else if (seedMode === 'minimal') {
		const dataset = await buildMinimalSeed();

		await prisma.$transaction(async (tx) => {
			await truncateSeedData(tx);
			await tx.accessGroup.createMany({ data: dataset.accessGroups });
			await tx.store.createMany({ data: dataset.stores });
			await tx.user.createMany({ data: dataset.users });
			await createTeams(tx, dataset.teams);
		}, SEED_TRANSACTION_OPTIONS);

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
