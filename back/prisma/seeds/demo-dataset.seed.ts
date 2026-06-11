import {
	DealImportance,
	DealLossReason,
	DealStage,
	DealStatus,
	type Prisma,
	type PrismaClient,
	LeadEventType,
	LeadSource,
	LeadStatus,
	SupportedFuelType,
	VehicleStatus,
} from '../../src/generated/prisma/client.js';
import { buildDemoOrg } from './demo-org.seed.js';
import {
	buildDemoAgendaItems,
	replaceAgendaItems,
} from './agenda-demo.seed.js';
import { deterministicUuid } from './seed-utils.js';

/** Dataset demo: 100 clientes/leads/veículos/negociações para KPIs e dashboards. */
export const DEFAULT_DEMO_RECORD_COUNT = 100;

const INVENTORY_VEHICLES_PER_STORE = 4;

const SEED_TRANSACTION_OPTIONS = {
	timeout: 120_000,
	maxWait: 30_000,
} as const;

export type RunDemoSeedOptions = {
	readonly recordCount?: number;
	readonly logSummary?: boolean;
};

const VEHICLE_CATALOG = [
	{ brand: 'Chevrolet', model: 'Onix', version: 'LT 1.0' },
	{ brand: 'Hyundai', model: 'HB20', version: 'Comfort 1.0' },
	{ brand: 'Toyota', model: 'Corolla', version: 'GLI 2.0' },
	{ brand: 'Hyundai', model: 'Creta', version: 'Action 1.6' },
	{ brand: 'Jeep', model: 'Compass', version: 'Longitude 1.3T' },
	{ brand: 'Fiat', model: 'Toro', version: 'Freedom 1.3T' },
	{ brand: 'Volkswagen', model: 'Nivus', version: 'Highline 1.0T' },
	{ brand: 'Volkswagen', model: 'T-Cross', version: 'Sense 1.0T' },
	{ brand: 'Chevrolet', model: 'Tracker', version: 'LTZ 1.2T' },
	{ brand: 'Jeep', model: 'Renegade', version: 'Sport 1.3T' },
] as const;

const DEAL_STAGES = [
	DealStage.INITIAL_CONTACT,
	DealStage.NEGOTIATION,
	DealStage.PROPOSAL,
	DealStage.CLOSING,
] as const;

const DEAL_IMPORTANCES = [
	DealImportance.COLD,
	DealImportance.WARM,
	DealImportance.HOT,
] as const;

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

const VEHICLE_COLORS = [
	'Prata',
	'Preto',
	'Branco',
	'Cinza',
	'Vermelho',
	'Azul',
] as const;

function stableHash(value: string): number {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i += 1) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function pickFrom<T>(arr: readonly T[], seed: string): T {
	return arr[stableHash(seed) % arr.length] as T;
}

function randomInt(min: number, max: number, seed: string): number {
	const span = Math.max(1, max - min + 1);
	return min + (stableHash(seed) % span);
}

function buildPlate(seed: string): string {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const digits = '0123456789';
	const h = stableHash(seed);
	return `${alphabet[(h >>> 0) % 26]}${alphabet[(h >>> 5) % 26]}${alphabet[(h >>> 10) % 26]}${digits[(h >>> 15) % 10]}${alphabet[(h >>> 20) % 26]}${digits[(h >>> 25) % 10]}${digits[(h >>> 28) % 10]}`;
}

function buildVin(seed: string): string {
	const alphabet = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
	const h = stableHash(seed);
	let out = '';
	for (let i = 0; i < 17; i += 1) {
		out += alphabet[(h + i * 31) % alphabet.length];
	}
	return out;
}

const LEAD_SOURCES = [
	LeadSource.WEBSITE,
	LeadSource.WHATSAPP,
	LeadSource.PHONE,
	LeadSource.WALK_IN,
	LeadSource.INDICATION,
	LeadSource.OTHER,
	LeadSource.INSTAGRAM,
	LeadSource.FACEBOOK,
	LeadSource.MERCADO_LIVRE,
] as const;

const SUPPORTED_FUEL_TYPES = [
	SupportedFuelType.GASOLINE,
	SupportedFuelType.ETHANOL,
	SupportedFuelType.FLEX,
	SupportedFuelType.DIESEL,
	SupportedFuelType.ELECTRIC,
	SupportedFuelType.HYBRID,
	SupportedFuelType.PLUG_IN_HYBRID,
	SupportedFuelType.CNG,
] as const;

const DEAL_LOSS_REASONS = [
	DealLossReason.NO_INTEREST,
	DealLossReason.PRICE_EXPECTATION,
	DealLossReason.BOUGHT_ELSEWHERE,
	DealLossReason.NO_RESPONSE,
	DealLossReason.VEHICLE_UNAVAILABLE,
	DealLossReason.OTHER,
] as const;

function buildDealStage(index: number): DealStage {
	return DEAL_STAGES[index % DEAL_STAGES.length] ?? DealStage.NEGOTIATION;
}

function buildDealImportance(index: number): DealImportance {
	return (
		DEAL_IMPORTANCES[index % DEAL_IMPORTANCES.length] ?? DealImportance.WARM
	);
}

/** ~70% abertas, ~15% ganhas e ~15% perdidas por ciclo de 20 registos. */
function buildDealStatus(index: number): DealStatus {
	const outcome = index % 20;
	if (outcome >= 17) {
		return DealStatus.WON;
	}
	if (outcome >= 14) {
		return DealStatus.LOST;
	}
	return DealStatus.OPEN;
}

function buildLeadStatusForDeal(
	index: number,
	dealStatus: DealStatus,
	stage: DealStage,
): LeadStatus {
	if (dealStatus === DealStatus.WON) {
		return LeadStatus.CONVERTED;
	}
	if (dealStatus === DealStatus.LOST) {
		return LeadStatus.LOST;
	}
	if (stage === DealStage.INITIAL_CONTACT && index % 7 === 0) {
		return LeadStatus.NEW;
	}
	switch (stage) {
		case DealStage.INITIAL_CONTACT:
			return LeadStatus.CONTACTED;
		case DealStage.NEGOTIATION:
			return LeadStatus.NEGOTIATING;
		case DealStage.PROPOSAL:
			return LeadStatus.QUALIFIED;
		case DealStage.CLOSING:
			return LeadStatus.NEGOTIATING;
		default:
			return LeadStatus.NEW;
	}
}

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

function buildLeadSource(index: number): LeadSource {
	return LEAD_SOURCES[index % LEAD_SOURCES.length] as LeadSource;
}

function buildLeadDate(index: number) {
	const now = new Date();
	const daysAgo = (index * 3) % 180;
	const createdAt = new Date(now);
	createdAt.setDate(now.getDate() - daysAgo);
	createdAt.setHours(8 + (index % 10), (index * 11) % 60, 0, 0);
	return createdAt;
}

function buildLeadEvents(
	leads: ReadonlyArray<{
		readonly id: string;
		readonly ownerUserId: string | null;
		readonly source: LeadSource;
		readonly createdAt: Date;
	}>,
	dealPlans: ReadonlyArray<{
		readonly status: DealStatus;
		readonly closedAt: Date | null;
		readonly updatedAt: Date;
	}>,
) {
	const events: Array<{
		id: string;
		leadId: string;
		actorUserId: string | null;
		type: LeadEventType;
		title: string;
		description: string;
		createdAt: Date;
	}> = [];

	for (const [index, lead] of leads.entries()) {
		const plan = dealPlans[index];
		events.push({
			id: deterministicUuid(`demo-lead-event:created:${index + 1}`),
			leadId: lead.id,
			actorUserId: lead.ownerUserId,
			type: LeadEventType.CREATED,
			title: 'Lead registado',
			description: `Lead criado via ${lead.source}.`,
			createdAt: lead.createdAt,
		});

		const firstContactAt = new Date(lead.createdAt);
		firstContactAt.setHours(firstContactAt.getHours() + 1 + (index % 72));
		events.push({
			id: deterministicUuid(`demo-lead-event:updated:${index + 1}`),
			leadId: lead.id,
			actorUserId: lead.ownerUserId,
			type: LeadEventType.UPDATED,
			title: 'Primeiro contacto',
			description: 'Atendimento iniciado pela equipa comercial.',
			createdAt: firstContactAt,
		});

		if (plan?.status === DealStatus.WON) {
			events.push({
				id: deterministicUuid(`demo-lead-event:converted:${index + 1}`),
				leadId: lead.id,
				actorUserId: lead.ownerUserId,
				type: LeadEventType.CONVERTED,
				title: 'Lead convertido',
				description: 'Negociação encerrada com sucesso.',
				createdAt: plan.closedAt ?? plan.updatedAt,
			});
		}
	}

	return events;
}

function buildInventoryVehicles(
	stores: ReadonlyArray<{ readonly id: string }>,
	recordCount: number,
) {
	return stores.flatMap((store, storeIndex) =>
		Array.from({ length: INVENTORY_VEHICLES_PER_STORE }, (_, slot) => {
			const index =
				recordCount + storeIndex * INVENTORY_VEHICLES_PER_STORE + slot;
			const catalog = VEHICLE_CATALOG[
				index % VEHICLE_CATALOG.length
			] as (typeof VEHICLE_CATALOG)[number];
			const seed = `inventory:${store.id}:${index}`;
			const createdAt = buildLeadDate(index);
			const modelYear = randomInt(2016, 2024, `${seed}:modelYear`);

			return {
				id: deterministicUuid(`demo-vehicle:inventory:${index + 1}`),
				storeId: store.id,
				brand: catalog.brand,
				model: catalog.model,
				version: catalog.version,
				modelYear,
				manufactureYear: Math.max(2015, modelYear - 1),
				color: pickFrom(VEHICLE_COLORS, `${seed}:color`),
				mileage: randomInt(8000, 95000, `${seed}:mileage`),
				supportedFuelType: pickFrom(SUPPORTED_FUEL_TYPES, `${seed}:fuel`),
				price: String(randomInt(38000, 165000, `${seed}:price`)),
				status: VehicleStatus.AVAILABLE,
				plate: buildPlate(seed),
				vin: buildVin(seed),
				createdAt,
				updatedAt: createdAt,
			};
		}),
	);
}

function resolveRecordCount(explicitCount?: number) {
	if (explicitCount !== undefined && explicitCount > 0) {
		return explicitCount;
	}
	const fromEnv = Number.parseInt(process.env.SEED_RECORD_COUNT ?? '', 10);
	return fromEnv > 0 ? fromEnv : DEFAULT_DEMO_RECORD_COUNT;
}

export async function runDemoSeed(
	prisma: PrismaClient,
	options: RunDemoSeedOptions = {},
) {
	const count = resolveRecordCount(options.recordCount);
	const logSummary = options.logSummary ?? true;
	const demoOrg = await buildDemoOrg();
	const { accessGroups, users, stores, teams, storePools, accounts } = demoOrg;

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

	const dealPlans = Array.from({ length: count }, (_, index) => {
		const stage = buildDealStage(index);
		const importance = buildDealImportance(index);
		const status = buildDealStatus(index);
		const createdAt = buildLeadDate(index);
		createdAt.setHours(createdAt.getHours() + 2);
		const updatedAt = new Date(createdAt);
		updatedAt.setDate(createdAt.getDate() + ((index % 5) + 1));
		const closedAt =
			status === DealStatus.WON || status === DealStatus.LOST
				? updatedAt
				: null;

		return {
			index,
			stage,
			importance,
			status,
			createdAt,
			updatedAt,
			closedAt,
		};
	});

	const deals = dealPlans.map((plan) => ({
		id: deterministicUuid(`demo-deal:${plan.index + 1}`),
		leadId: deterministicUuid(`demo-lead:${plan.index + 1}`),
		vehicleId: deterministicUuid(`demo-vehicle:${plan.index + 1}`),
		title: `Negociação ${buildVehicle(plan.index)} · ${customers[plan.index]?.name ?? 'Cliente'}`,
		value: String(65000 + ((plan.index * 1750) % 90000)),
		importance: plan.importance,
		stage: plan.stage,
		status: plan.status,
		lossReason:
			plan.status === DealStatus.LOST
				? (DEAL_LOSS_REASONS[plan.index % DEAL_LOSS_REASONS.length] ?? null)
				: null,
		closedAt: plan.closedAt,
		createdAt: plan.createdAt,
		updatedAt: plan.updatedAt,
	}));

	const leads = dealPlans.map((plan) => {
		const store = storePools[plan.index % storePools.length];
		if (!store) {
			throw new Error('Demo seed requires at least one store pool.');
		}
		const owner = store.owners[plan.index % store.owners.length];
		const createdAt = buildLeadDate(plan.index);
		const catalog = VEHICLE_CATALOG[
			plan.index % VEHICLE_CATALOG.length
		] as (typeof VEHICLE_CATALOG)[number];

		return {
			id: deterministicUuid(`demo-lead:${plan.index + 1}`),
			customerId: customers[plan.index]?.id ?? '',
			storeId: store?.id ?? stores[0]?.id ?? '',
			ownerUserId: owner?.id ?? null,
			source: buildLeadSource(plan.index),
			status: buildLeadStatusForDeal(plan.index, plan.status, plan.stage),
			vehicleInterestText: `${catalog.brand} ${catalog.model} ${catalog.version}`,
			createdAt,
			updatedAt: plan.updatedAt,
		};
	});

	const dealVehicles = leads.map((lead, index) => {
		const deal = deals[index];
		const createdAt = deal?.createdAt ?? new Date();
		const updatedAt = deal?.updatedAt ?? createdAt;
		const status =
			deal?.status === DealStatus.OPEN
				? VehicleStatus.RESERVED
				: deal?.status === DealStatus.WON
					? VehicleStatus.SOLD
					: VehicleStatus.AVAILABLE;

		const catalog = VEHICLE_CATALOG[
			index % VEHICLE_CATALOG.length
		] as (typeof VEHICLE_CATALOG)[number];
		const seed = `${lead.storeId}:${lead.id}:${deal?.id ?? index}`;
		const modelYear = randomInt(2018, 2025, `${seed}:modelYear`);
		const manufactureYear = Math.max(
			2017,
			modelYear - randomInt(0, 1, `${seed}:manufactureDelta`),
		);
		const mileage =
			deal?.status === DealStatus.OPEN
				? randomInt(5000, 85000, `${seed}:mileageOpen`)
				: randomInt(12000, 120000, `${seed}:mileageClosed`);

		return {
			id: deterministicUuid(`demo-vehicle:${index + 1}`),
			storeId: lead.storeId,
			brand: catalog.brand,
			model: catalog.model,
			version: catalog.version,
			modelYear,
			manufactureYear,
			color: pickFrom(VEHICLE_COLORS, `${seed}:color`),
			mileage,
			supportedFuelType: pickFrom(SUPPORTED_FUEL_TYPES, `${seed}:fuel`),
			price: deal?.value ?? String(randomInt(42000, 180000, `${seed}:price`)),
			status,
			plate: buildPlate(seed),
			vin: buildVin(seed),
			createdAt,
			updatedAt,
		};
	});

	const inventoryVehicles = buildInventoryVehicles(stores, count);
	const vehicles = [...dealVehicles, ...inventoryVehicles];
	const leadEvents = buildLeadEvents(leads, dealPlans);
	const agendaItems = buildDemoAgendaItems(demoOrg.users, leads);

	await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		await tx.$executeRawUnsafe(`
				TRUNCATE TABLE
					"DealHistory",
					"LeadEvent",
					"Deal",
					"Vehicle",
					"Lead",
					"Customer",
					"_TeamMembers",
					"Team",
					"Store"
				RESTART IDENTITY CASCADE
			`);
		await tx.authSession.deleteMany();
		await tx.auditLog.deleteMany();
		await tx.user.deleteMany();
		await tx.accessGroup.deleteMany();

		await tx.accessGroup.createMany({ data: accessGroups });
		await tx.user.createMany({
			data: users.map(({ accessGroupIds: _accessGroupIds, ...user }) => user),
		});
		await tx.userAccessGroup.createMany({
			data: users.flatMap((user) =>
				user.accessGroupIds.map((accessGroupId) => ({
					userId: user.id,
					accessGroupId,
				})),
			),
		});
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
		await tx.vehicle.createMany({ data: vehicles });
		await tx.deal.createMany({ data: deals });
		await tx.leadEvent.createMany({ data: leadEvents });
		await replaceAgendaItems(tx, agendaItems);
	}, SEED_TRANSACTION_OPTIONS);

	if (!logSummary) {
		return {
			recordCount: count,
			users: users.length,
			teams: teams.length,
			stores: stores.length,
			customers: customers.length,
			leads: leads.length,
			vehicles: vehicles.length,
			inventoryVehicles: inventoryVehicles.length,
			deals: deals.length,
			leadEvents: leadEvents.length,
			agendaItems: agendaItems.length,
		};
	}

	const [dealDistribution, leadOwners, leadSources, dealOutcomes] =
		await Promise.all([
			prisma.deal.groupBy({
				by: ['importance', 'stage'],
				_count: { _all: true },
			}),
			prisma.lead.groupBy({
				by: ['ownerUserId'],
				_count: { _all: true },
			}),
			prisma.lead.groupBy({
				by: ['source'],
				_count: { _all: true },
			}),
			prisma.deal.groupBy({
				by: ['status'],
				_count: { _all: true },
			}),
		]);

	const ownerLabels = new Map(
		demoOrg.leadOwners.map((owner) => [owner.id, owner.email]),
	);

	const summary = {
		ok: true,
		counts: {
			users: users.length,
			teams: teams.length,
			stores: stores.length,
			customers: customers.length,
			leads: leads.length,
			vehicles: vehicles.length,
			inventoryVehicles: inventoryVehicles.length,
			deals: deals.length,
			leadEvents: leadEvents.length,
			agendaItems: agendaItems.length,
		},
		accounts,
		teams: teams.map((team) => ({
			name: team.name,
			storeId: team.storeId,
			members: team.memberIds.length,
		})),
		leadOwnerDistribution: leadOwners.map((row) => ({
			owner: ownerLabels.get(row.ownerUserId ?? '') ?? row.ownerUserId,
			count: row._count._all,
		})),
		dealDistribution: dealDistribution.map((row) => ({
			importance: row.importance,
			stage: row.stage,
			count: row._count._all,
		})),
		dealOutcomes: dealOutcomes.map((row) => ({
			status: row.status,
			count: row._count._all,
		})),
		leadSourceDistribution: leadSources.map((row) => ({
			source: row.source,
			count: row._count._all,
		})),
		stores: storePools.map((store) => ({
			id: store.id,
			name: store.name,
			team: store.teamName,
			leadsPerStore: Math.ceil(count / storePools.length),
		})),
	};

	console.log(JSON.stringify(summary, null, 2));
	return summary;
}
