import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import {
	PrismaClient,
	LeadSource,
	LeadStatus,
	UserRole,
} from '../src/generated/prisma/client.js';
import { deterministicUuid } from '../prisma/seeds/seed-utils.js';

const DEFAULT_CONNECTION_STRING =
	'postgresql://abp:abp@localhost:5433/lead_management';
const DEFAULT_COUNT = 100;

const FIRST_NAMES = [
	'Lucas',
	'Mateus',
	'Gabriel',
	'Rafael',
	'Thiago',
	'Bruno',
	'Felipe',
	'Leonardo',
	'Henrique',
	'Caio',
	'Pedro',
	'Victor',
	'Gustavo',
	'Marcos',
	'André',
	'João',
	'Carlos',
	'Daniel',
	'Rodrigo',
	'Vinicius',
	'Ana',
	'Mariana',
	'Beatriz',
	'Camila',
	'Fernanda',
	'Juliana',
	'Patricia',
	'Larissa',
	'Renata',
	'Carolina',
	'Amanda',
	'Bianca',
	'Claudia',
	'Vanessa',
	'Priscila',
	'Leticia',
	'Gabriela',
	'Isabela',
	'Natalia',
	'Monica',
] as const;

const LAST_NAMES = [
	'Silva',
	'Souza',
	'Oliveira',
	'Santos',
	'Lima',
	'Costa',
	'Pereira',
	'Ferreira',
	'Rodrigues',
	'Almeida',
	'Nogueira',
	'Carvalho',
	'Gomes',
	'Martins',
	'Barbosa',
	'Araújo',
	'Correia',
	'Teixeira',
	'Moreira',
	'Monteiro',
] as const;

const VEHICLES = [
	'Onix LT',
	'HB20 Comfort',
	'Corolla GLI',
	'Creta Action',
	'Compass Longitude',
	'Toro Freedom',
	'Nivus Highline',
	'T-Cross Sense',
	'Tracker LTZ',
	'Renegade Sport',
] as const;

const LEAD_SOURCES = [
	LeadSource.WHATSAPP,
	LeadSource.PHONE,
	LeadSource.WALK_IN,
	LeadSource.INSTAGRAM,
	LeadSource.WEBSITE,
	LeadSource.INDICATION,
] as const;

const LEAD_STATUSES = [
	LeadStatus.NEW,
	LeadStatus.CONTACTED,
	LeadStatus.QUALIFIED,
	LeadStatus.NEGOTIATING,
	LeadStatus.CONVERTED,
	LeadStatus.LOST,
] as const;

type StoreOwnerPool = {
	readonly id: string;
	readonly name: string;
	readonly owners: {
		readonly id: string;
		readonly name: string;
		readonly email: string;
	}[];
};

type ExistingUserRecord = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly role: UserRole;
};

type StoreSeed = {
	readonly id: string;
	readonly name: string;
};

type TeamSeed = {
	readonly id: string;
	readonly name: string;
	readonly storeId: string;
	readonly memberIds: readonly string[];
	readonly managerId: string | null;
};

const STORE_NAMES = [
	'Loja Jacareí',
	'Loja São José dos Campos',
	'Loja Caçapava',
	'Loja Taubaté',
] as const;

const TEAM_NAMES = [
	'Equipe Alfa',
	'Equipe Bravo',
	'Equipe Charlie',
	'Equipe Delta',
	'Equipe Echo',
	'Equipe Foxtrot',
	'Equipe Golf',
	'Equipe Hotel',
] as const;

function slugify(value: string) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z\s]/g, '')
		.trim()
		.replace(/\s+/g, '.');
}

function generateValidCpf(seed: number) {
	const base = String(100000000 + seed).padStart(9, '0');
	const digits = base.split('').map(Number);

	const calculateDigit = (weightsStart: number, sourceDigits: number[]) => {
		const sum = sourceDigits.reduce(
			(total, digit, index) => total + digit * (weightsStart - index),
			0,
		);
		const result = (sum * 10) % 11;
		return result === 10 ? 0 : result;
	};

	const firstDigit = calculateDigit(10, digits);
	const secondDigit = calculateDigit(11, [...digits, firstDigit]);
	return `${base}${firstDigit}${secondDigit}`;
}

function buildCustomerName(index: number) {
	const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
	const lastName =
		LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
	const familyName =
		LAST_NAMES[
			Math.floor(index / (FIRST_NAMES.length * 2)) % LAST_NAMES.length
		];
	return `${firstName} ${lastName} ${familyName}`;
}

function buildPhone(index: number) {
	const suffix = String(10000000 + index).slice(-8);
	return `+55119${suffix}`;
}

function buildVehicle(index: number) {
	return VEHICLES[index % VEHICLES.length];
}

function buildLeadStatus(index: number) {
	return LEAD_STATUSES[index % LEAD_STATUSES.length];
}

function buildLeadSource(index: number) {
	return LEAD_SOURCES[index % LEAD_SOURCES.length];
}

function buildLeadDate(index: number) {
	const now = new Date();
	const daysAgo = (index * 2) % 45;
	const createdAt = new Date(now);
	createdAt.setDate(now.getDate() - daysAgo);
	createdAt.setHours(9 + (index % 8), (index * 7) % 60, 0, 0);
	return createdAt;
}

function chunkAttendants(
	attendants: readonly ExistingUserRecord[],
	chunks: number,
) {
	const safeChunks = Math.max(1, chunks);
	return Array.from({ length: safeChunks }, (_, chunkIndex) =>
		attendants.filter(
			(_, attendantIndex) => attendantIndex % safeChunks === chunkIndex,
		),
	).filter((chunk) => chunk.length > 0);
}

function buildStores() {
	return STORE_NAMES.map((name, index) => ({
		id: deterministicUuid(`demo-store:${index + 1}`),
		name,
	})) satisfies StoreSeed[];
}

function buildTeams(
	stores: readonly StoreSeed[],
	attendants: readonly ExistingUserRecord[],
) {
	const attendantGroups = chunkAttendants(
		attendants,
		Math.min(TEAM_NAMES.length, attendants.length),
	);

	return attendantGroups.map((group, index) => ({
		id: deterministicUuid(`demo-team:${index + 1}`),
		name: TEAM_NAMES[index] ?? `Equipe ${index + 1}`,
		storeId: stores[index % stores.length]?.id ?? stores[0]?.id ?? '',
		memberIds: group.map((attendant) => attendant.id),
		managerId: null,
	})) satisfies TeamSeed[];
}

function buildStorePools(
	stores: readonly StoreSeed[],
	teams: readonly TeamSeed[],
	attendantsById: ReadonlyMap<string, ExistingUserRecord>,
) {
	return stores
		.map((store) => {
			const owners = teams
				.filter((team) => team.storeId === store.id)
				.flatMap((team) => team.memberIds)
				.map((memberId) => attendantsById.get(memberId))
				.filter((owner): owner is ExistingUserRecord => owner !== undefined)
				.map((owner) => ({
					id: owner.id,
					name: owner.name,
					email: owner.email,
				}));

			return {
				id: store.id,
				name: store.name,
				owners,
			} satisfies StoreOwnerPool;
		})
		.filter((store) => store.owners.length > 0);
}

async function main() {
	const connectionString =
		process.env.DATABASE_URL ?? DEFAULT_CONNECTION_STRING;
	const count =
		Number.parseInt(process.env.LEAD_RESEED_COUNT ?? '', 10) || DEFAULT_COUNT;

	const prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString }),
	});
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
		},
		orderBy: [{ role: 'asc' }, { name: 'asc' }],
	});
	const attendants = users.filter((user) => user.role === UserRole.ATTENDANT);

	if (attendants.length === 0) {
		throw new Error(
			'Nenhum atendente foi encontrado para montar o reseed operacional.',
		);
	}

	const stores = buildStores();
	const teams = buildTeams(stores, attendants);
	const attendantsById = new Map(attendants.map((user) => [user.id, user]));
	const storePools = buildStorePools(stores, teams, attendantsById);

	if (storePools.length === 0) {
		throw new Error(
			'Não foi possível montar lojas com atendentes responsáveis.',
		);
	}

	const customers = Array.from({ length: count }, (_, index) => {
		const customerNumber = index + 1;
		const name = buildCustomerName(index);
		return {
			id: deterministicUuid(`demo-customer:${customerNumber}`),
			name,
			email: `${slugify(name)}.${customerNumber}@cliente.demo.br`,
			phone: buildPhone(customerNumber),
			cpf: generateValidCpf(customerNumber),
		};
	});

	const leads = Array.from({ length: count }, (_, index) => {
		const store = storePools[index % storePools.length];
		const owner = store.owners[index % store.owners.length];
		const createdAt = buildLeadDate(index);
		const status = buildLeadStatus(index);
		const updatedAt = new Date(createdAt);
		updatedAt.setDate(createdAt.getDate() + ((index % 5) + 1));

		return {
			id: deterministicUuid(`demo-lead:${index + 1}`),
			customerId: customers[index]?.id ?? '',
			storeId: store.id,
			ownerUserId: owner.id,
			source: buildLeadSource(index),
			status,
			createdAt,
			updatedAt,
		};
	});

	const deals = leads.map((lead, index) => {
		const createdAt = new Date(lead.createdAt);
		createdAt.setHours(createdAt.getHours() + 2);
		const updatedAt = new Date(lead.updatedAt);
		const closedAt =
			lead.status === LeadStatus.CONVERTED || lead.status === LeadStatus.LOST
				? updatedAt
				: null;

		return {
			id: deterministicUuid(`demo-deal:${index + 1}`),
			leadId: lead.id,
			title: `Negociação ${buildVehicle(index)} · ${customers[index]?.name ?? 'Cliente'}`,
			value: String(65000 + ((index * 1750) % 90000)),
			closedAt,
			createdAt,
			updatedAt,
		};
	});

	await prisma.$transaction(
		async (tx) => {
			await tx.deal.deleteMany();
			await tx.lead.deleteMany();
			await tx.customer.deleteMany();
			await tx.team.deleteMany();
			await tx.store.deleteMany();
			await tx.store.createMany({ data: stores });
			for (const team of teams) {
				await tx.team.create({
					data: {
						id: team.id,
						name: team.name,
						storeId: team.storeId,
						managerId: team.managerId,
						members: {
							connect: team.memberIds.map((memberId) => ({ id: memberId })),
						},
					},
				});
			}
			await tx.customer.createMany({ data: customers });
			await tx.lead.createMany({ data: leads });
			await tx.deal.createMany({ data: deals });
		},
		{
			timeout: 60_000,
			maxWait: 15_000,
		},
	);

	console.log(
		JSON.stringify(
			{
				ok: true,
				counts: {
					stores: stores.length,
					teams: teams.length,
					customers: customers.length,
					leads: leads.length,
					deals: deals.length,
				},
				stores: storePools.map((store) => ({
					id: store.id,
					name: store.name,
					owners: store.owners.length,
				})),
				teams: teams.map((team) => ({
					id: team.id,
					name: team.name,
					storeId: team.storeId,
					members: team.memberIds.length,
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
