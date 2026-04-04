import 'dotenv/config';

import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
import {
	LeadSource,
	LeadStatus,
	UserRole,
} from '../src/shared/constants/enums.js';
import { customersSeed } from '../src/shared/seeds/customers.seed.js';
import { leadsSeed } from '../src/shared/seeds/leads.seed.js';
import { storesSeed } from '../src/shared/seeds/stores.seed.js';
import { teamsSeed } from '../src/shared/seeds/teams.seed.js';
import { usersSeed } from '../src/shared/seeds/users.seed.js';

const connectionString =
	process.env.DATABASE_URL ??
	'postgresql://abp:abp@localhost:5433/lead_management';

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

async function hashPassword(plainPassword: string) {
	return argon2.hash(plainPassword, {
		type: argon2.argon2id,
		memoryCost: 19456,
		timeCost: 2,
		parallelism: 1,
	});
}

export async function runSeed() {
	console.log('Running seed...');

	for (const team of teamsSeed) {
		await prisma.team.upsert({
			where: { id: team.id },
			create: team,
			update: { name: team.name },
		});
	}

	for (const store of storesSeed) {
		await prisma.store.upsert({
			where: { id: store.id },
			create: store,
			update: { name: store.name },
		});
	}

	for (const user of usersSeed) {
		const password = await hashPassword(user.password);

		await prisma.user.upsert({
			where: { id: user.id },
			create: {
				...user,
				password,
				role: UserRole[user.role as keyof typeof UserRole],
			},
			update: {
				name: user.name,
				email: user.email,
				password,
				role: UserRole[user.role as keyof typeof UserRole],
				teamId: user.teamId,
			},
		});
	}

	for (const customer of customersSeed) {
		await prisma.customer.upsert({
			where: { id: customer.id },
			create: customer,
			update: {
				name: customer.name,
				email: customer.email,
				phone: customer.phone,
				cpf: customer.cpf ?? null,
			},
		});
	}

	for (const lead of leadsSeed) {
		const source = LeadSource[lead.source as keyof typeof LeadSource];
		const existingLead = await prisma.lead.findFirst({
			where: {
				customerId: lead.customerId,
				storeId: lead.storeId,
				ownerUserId: lead.ownerUserId,
				source,
			},
		});

		if (!existingLead) {
			await prisma.lead.create({
				data: {
					...lead,
					source,
					status: LeadStatus.NEW,
				},
			});
		}
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
