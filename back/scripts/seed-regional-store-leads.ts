import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
import {
	LeadSource,
	LeadStatus,
	UserRole,
} from '../src/generated/prisma/enums.js';
import { deterministicUuid } from '../prisma/seeds/seed-utils.js';

const DEFAULT_CONNECTION_STRING =
	'postgresql://abp:abp@localhost:5433/lead_management';

const regionalPlan = [
	{ code: 'AM', label: 'Amazonas', leads: 3 },
	{ code: 'PA', label: 'Para', leads: 6 },
	{ code: 'CE', label: 'Ceara', leads: 9 },
	{ code: 'PE', label: 'Pernambuco', leads: 12 },
	{ code: 'BA', label: 'Bahia', leads: 16 },
	{ code: 'GO', label: 'Goias', leads: 18 },
	{ code: 'DF', label: 'Distrito Federal', leads: 20 },
	{ code: 'MG', label: 'Minas Gerais', leads: 24 },
	{ code: 'RJ', label: 'Rio de Janeiro', leads: 28 },
	{ code: 'PR', label: 'Parana', leads: 14 },
	{ code: 'SC', label: 'Santa Catarina', leads: 8 },
	{ code: 'RS', label: 'Rio Grande do Sul', leads: 11 },
	{ code: 'MT', label: 'Mato Grosso', leads: 5 },
	{ code: 'ES', label: 'Espirito Santo', leads: 7 },
] as const;

const sources = [
	LeadSource.WHATSAPP,
	LeadSource.INSTAGRAM,
	LeadSource.FACEBOOK,
	LeadSource.MERCADO_LIVRE,
	LeadSource.WEBSITE,
	LeadSource.INDICATION,
	LeadSource.PHONE,
	LeadSource.WALK_IN,
] as const;

const statuses = [
	LeadStatus.NEW,
	LeadStatus.CONTACTED,
	LeadStatus.QUALIFIED,
	LeadStatus.NEGOTIATING,
	LeadStatus.CONVERTED,
] as const;

const customerNameParts = [
	'Alfa',
	'Beta',
	'Gama',
	'Delta',
	'Epsilon',
	'Zeta',
	'Teta',
	'Iota',
	'Kappa',
	'Lambda',
	'Mu',
	'Nu',
] as const;

function pickFrom<T>(items: readonly T[], index: number) {
	return items[index % items.length] as T;
}

function buildPhone(stateIndex: number, leadIndex: number) {
	const suffix = String(9000 + stateIndex * 100 + leadIndex).padStart(4, '0');
	return `1198${String(stateIndex).padStart(2, '0')}${suffix}`;
}

function buildCreatedAt(stateIndex: number, leadIndex: number) {
	const createdAt = new Date();
	createdAt.setDate(createdAt.getDate() - (stateIndex * 3 + leadIndex));
	createdAt.setHours(9 + (leadIndex % 8), 15, 0, 0);
	return createdAt;
}

async function main() {
	const connectionString =
		process.env.DATABASE_URL ?? DEFAULT_CONNECTION_STRING;
	const prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString }),
	});

	const users = await prisma.user.findMany({
		select: { id: true, role: true },
		orderBy: [{ role: 'asc' }, { name: 'asc' }],
	});
	const scopedUsers = users.filter((user) => user.role !== UserRole.ADMIN);
	const leadOwners = scopedUsers.length > 0 ? scopedUsers : users;
	const manager =
		users.find((user) => user.role === UserRole.MANAGER) ??
		users.find((user) => user.role === UserRole.GENERAL_MANAGER) ??
		null;

	if (leadOwners.length === 0) {
		throw new Error('Nenhum usuário encontrado para vincular leads regionais.');
	}

	const stores = regionalPlan.map((state) => ({
		id: deterministicUuid(`regional-store:${state.code}`),
		name: `Loja Regional ${state.label}`,
	}));
	const teams = regionalPlan.map((state) => ({
		id: deterministicUuid(`regional-team:${state.code}`),
		name: `Equipe Regional ${state.label}`,
		storeId: deterministicUuid(`regional-store:${state.code}`),
		managerId: manager?.id ?? null,
	}));
	const customers = regionalPlan.flatMap((state, stateIndex) =>
		Array.from({ length: state.leads }, (_, leadIndex) => {
			const namePart = pickFrom(customerNameParts, leadIndex);
			return {
				id: deterministicUuid(
					`regional-customer:${state.code}:${leadIndex + 1}`,
				),
				name: `Cliente Regional ${state.label} ${namePart}`,
				email: `regional.${state.code.toLowerCase()}.${leadIndex + 1}@cliente.demo.br`,
				phone: buildPhone(stateIndex, leadIndex),
				cpf: null,
			};
		}),
	);
	const leads = regionalPlan.flatMap((state, stateIndex) =>
		Array.from({ length: state.leads }, (_, leadIndex) => {
			const createdAt = buildCreatedAt(stateIndex, leadIndex);
			const updatedAt = new Date(createdAt);
			updatedAt.setHours(createdAt.getHours() + 2);
			const owner = pickFrom(leadOwners, stateIndex + leadIndex);
			return {
				id: deterministicUuid(`regional-lead:${state.code}:${leadIndex + 1}`),
				customerId: deterministicUuid(
					`regional-customer:${state.code}:${leadIndex + 1}`,
				),
				storeId: deterministicUuid(`regional-store:${state.code}`),
				ownerUserId: owner.id,
				source: pickFrom(sources, stateIndex + leadIndex),
				status: pickFrom(statuses, stateIndex + leadIndex),
				vehicleInterestText: 'Interesse regional para teste de mapa',
				createdAt,
				updatedAt,
			};
		}),
	);
	const teamMembers = scopedUsers.map((user) => ({ id: user.id }));

	await prisma.$transaction(
		async (tx) => {
			await tx.store.createMany({
				data: stores,
				skipDuplicates: true,
			});

			for (const team of teams) {
				await tx.team.upsert({
					create: {
						id: team.id,
						name: team.name,
						storeId: team.storeId,
						managerId: team.managerId,
						members:
							teamMembers.length > 0
								? {
										connect: teamMembers,
									}
								: undefined,
					},
					update: {
						name: team.name,
						storeId: team.storeId,
						managerId: team.managerId,
						members: {
							set: teamMembers,
						},
					},
					where: { id: team.id },
				});
			}

			await tx.customer.createMany({
				data: customers,
				skipDuplicates: true,
			});
			await tx.lead.createMany({
				data: leads,
				skipDuplicates: true,
			});
		},
		{ maxWait: 15_000, timeout: 120_000 },
	);

	const totalCreatedOrUpdated = regionalPlan.reduce(
		(total, state) => total + state.leads,
		0,
	);

	console.log(
		JSON.stringify(
			{
				ok: true,
				stores: regionalPlan.length,
				leads: totalCreatedOrUpdated,
				states: regionalPlan.map((state) => ({
					code: state.code,
					leads: state.leads,
				})),
			},
			null,
			2,
		),
	);

	await prisma.$disconnect();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
