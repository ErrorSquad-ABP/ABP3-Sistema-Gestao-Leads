import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	LeadSource,
	LeadStatus,
	SupportedFuelType,
	UserRole,
	VehicleStatus,
} from '../../src/generated/prisma/enums.js';
import { Cpf } from '../../src/shared/domain/value-objects/cpf.value-object.js';

import { deterministicUuid, hashPassword } from './seed-utils.js';
import {
	SYSTEM_ACCESS_GROUPS,
	type DashboardSeedDataset,
} from './seed-definitions.js';

type DashboardCsvRow = {
	lead_id: string;
	team_name: string;
	user_name: string;
	user_email: string;
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	customer_cpf: string;
	source: string;
	subject: string;
	lead_created_at: string;
	first_interaction_at: string;
	negotiation_importance: string;
	negotiation_stage: string;
	negotiation_status: string;
	is_open: string;
	negotiation_created_at: string;
	negotiation_updated_at: string;
	finalization_reason: string;
};

const CSV_FILE_PATH = resolve(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'data',
	'dados_dashboard_ficticios.csv',
);

const DEFAULT_PASSWORD = 'admin123';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const SUPPORT_USERS = [
	{
		email: 'admin@crm.com',
		name: 'Administrador',
		role: UserRole.ADMIN,
		accessGroupId: deterministicUuid('access-group:administrator'),
	},
	{
		email: 'geral@crm.com',
		name: 'Gerente Geral',
		role: UserRole.GENERAL_MANAGER,
		accessGroupId: deterministicUuid('access-group:general-manager'),
	},
] as const;

const CSV_SOURCE_TO_ENUM = {
	Facebook: LeadSource.FACEBOOK,
	Indicacao: LeadSource.INDICATION,
	Instagram: LeadSource.INSTAGRAM,
	'Loja Fisica': LeadSource.WALK_IN,
	'Mercado Livre': LeadSource.MERCADO_LIVRE,
	WhatsApp: LeadSource.WHATSAPP,
} as const;

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

const VEHICLE_COLORS = [
	'Prata',
	'Preto',
	'Branco',
	'Cinza',
	'Vermelho',
	'Azul',
] as const;

const VEHICLE_FUEL_TYPES = [
	SupportedFuelType.FLEX,
	SupportedFuelType.GASOLINE,
	SupportedFuelType.ETHANOL,
	SupportedFuelType.DIESEL,
	SupportedFuelType.HYBRID,
	SupportedFuelType.ELECTRIC,
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
	// Mercosul format (simplified): ABC1D23 (no strict validation needed for dev UI)
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const digits = '0123456789';
	const h = stableHash(seed);
	const a = alphabet[(h >>> 0) % 26] ?? 'A';
	const b = alphabet[(h >>> 5) % 26] ?? 'A';
	const c = alphabet[(h >>> 10) % 26] ?? 'A';
	const d1 = digits[(h >>> 15) % 10] ?? '0';
	const d2 = alphabet[(h >>> 20) % 26] ?? 'A';
	const d3 = digits[(h >>> 25) % 10] ?? '0';
	const d4 = digits[(h >>> 28) % 10] ?? '0';
	return `${a}${b}${c}${d1}${d2}${d3}${d4}`;
}

function buildVin(seed: string): string {
	// 17-char VIN-like (no I/O/Q), deterministic
	const alphabet = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
	const h = stableHash(seed);
	let out = '';
	for (let i = 0; i < 17; i += 1) {
		out += alphabet[(h + i * 31) % alphabet.length];
	}
	return out;
}

function normalizeLabel(value: string) {
	return value
		.trim()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

function parseCsvLine(line: string) {
	const values: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index];
		const nextCharacter = line[index + 1];

		if (character === '"') {
			if (inQuotes && nextCharacter === '"') {
				current += '"';
				index += 1;
				continue;
			}

			inQuotes = !inQuotes;
			continue;
		}

		if (character === ',' && !inQuotes) {
			values.push(current);
			current = '';
			continue;
		}

		current += character;
	}

	values.push(current);
	return values;
}

function parseCsv(content: string): DashboardCsvRow[] {
	const [headerLine, ...lines] = content
		.replace(/^\uFEFF/, '')
		.split(/\r?\n/)
		.filter((line) => line.trim().length > 0);

	if (!headerLine) {
		return [];
	}

	const headers = parseCsvLine(headerLine);

	return lines.map((line, lineIndex) => {
		const values = parseCsvLine(line);

		if (values.length !== headers.length) {
			throw new Error(
				`Invalid CSV structure at line ${lineIndex + 2}: expected ${headers.length} columns but received ${values.length}.`,
			);
		}

		return headers.reduce<Record<string, string>>(
			(record, header, columnIndex) => {
				record[header] = values[columnIndex] ?? '';
				return record;
			},
			{},
		) as DashboardCsvRow;
	});
}

function trimNullable(value: string) {
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}

function numberToLetters(value: number) {
	if (!Number.isInteger(value) || value <= 0) {
		return String(value);
	}

	let remaining = value;
	let result = '';

	while (remaining > 0) {
		remaining -= 1;
		result = ALPHABET[remaining % 26] + result;
		remaining = Math.floor(remaining / 26);
	}

	return result;
}

function sanitizeSeedName(value: string) {
	return value
		.trim()
		.replace(/\s+/g, ' ')
		.replace(/\b\d+\b/g, (match) => numberToLetters(Number(match)));
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

function normalizeCustomerCpf(rawValue: string, seed: number) {
	const digits = rawValue.replace(/\D/g, '');

	if (digits.length === 11) {
		try {
			return Cpf.create(digits).value;
		} catch {
			// fall through to deterministic replacement
		}
	}

	return generateValidCpf(seed);
}

function buildCustomerKey(row: DashboardCsvRow) {
	return (
		trimNullable(row.customer_cpf) ??
		trimNullable(row.customer_email)?.toLowerCase() ??
		`lead:${row.lead_id.trim()}`
	);
}

function parseDate(value: string) {
	const normalized = value.trim();

	if (normalized.length === 0) {
		return null;
	}

	return new Date(normalized.replace(' ', 'T'));
}

function buildStoreName(teamName: string) {
	const normalized = teamName.trim();
	return normalized.startsWith('Equipe ')
		? `Loja ${normalized.slice('Equipe '.length)}`
		: `Loja ${normalized}`;
}

function mapLeadSource(source: string) {
	const mappedSource =
		CSV_SOURCE_TO_ENUM[
			normalizeLabel(source) as keyof typeof CSV_SOURCE_TO_ENUM
		];

	if (!mappedSource) {
		throw new Error(`Unsupported lead source in CSV: ${source}`);
	}

	return mappedSource;
}

function mapLeadStatus(row: DashboardCsvRow) {
	switch (normalizeLabel(row.negotiation_status).toLowerCase()) {
		case 'finalizado com venda':
			return LeadStatus.CONVERTED;
		case 'finalizado sem venda':
			return LeadStatus.LOST;
		case 'em negociacao':
			return LeadStatus.NEGOTIATING;
		default:
			switch (normalizeLabel(row.negotiation_stage).toLowerCase()) {
				case 'contato inicial':
					return LeadStatus.CONTACTED;
				case 'aguardando resposta do cliente':
					return LeadStatus.QUALIFIED;
				default:
					return row.first_interaction_at.trim().length > 0
						? LeadStatus.NEGOTIATING
						: LeadStatus.NEW;
			}
	}
}

export async function buildDashboardCsvSeed(): Promise<DashboardSeedDataset> {
	const csvContent = await readFile(CSV_FILE_PATH, 'utf-8');
	const rows = parseCsv(csvContent);
	const passwordHash = await hashPassword(DEFAULT_PASSWORD);

	const stores = Array.from(
		new Set(rows.map((row) => row.team_name.trim())),
	).map((teamName) => ({
		id: deterministicUuid(`store:${teamName}`),
		name: buildStoreName(teamName),
	}));

	const storeIdByOriginalTeamName = new Map(
		Array.from(new Set(rows.map((row) => row.team_name.trim()))).map(
			(teamName) => [teamName, deterministicUuid(`store:${teamName}`)],
		),
	);

	const csvUsers = Array.from(
		new Map(
			rows.map((row) => [
				row.user_email.trim().toLowerCase(),
				{
					id: deterministicUuid(`user:${row.user_email.trim().toLowerCase()}`),
					name: sanitizeSeedName(row.user_name),
					email: row.user_email.trim().toLowerCase(),
					password: passwordHash,
					role: UserRole.ATTENDANT,
					accessGroupId: deterministicUuid('access-group:attendant'),
				},
			]),
		).values(),
	);

	const users = [
		...SUPPORT_USERS.map((user) => ({
			id: deterministicUuid(`user:${user.email}`),
			name: user.name,
			email: user.email,
			password: passwordHash,
			role: user.role,
			accessGroupId: user.accessGroupId,
		})),
		...csvUsers,
	];

	const userIdByEmail = new Map(users.map((user) => [user.email, user.id]));
	const teamsByName = new Map<
		string,
		{
			id: string;
			name: string;
			storeId: string;
			managerId: string | null;
			memberIds: string[];
		}
	>();

	for (const row of rows) {
		const teamName = row.team_name.trim();
		const ownerId =
			userIdByEmail.get(row.user_email.trim().toLowerCase()) ?? null;
		const existing = teamsByName.get(teamName) ?? {
			id: deterministicUuid(`team:${teamName}`),
			name: teamName,
			storeId:
				storeIdByOriginalTeamName.get(teamName) ??
				deterministicUuid(`store:${teamName}`),
			managerId: null,
			memberIds: [],
		};

		if (ownerId !== null && !existing.memberIds.includes(ownerId)) {
			existing.memberIds.push(ownerId);
		}

		teamsByName.set(teamName, existing);
	}

	const teams = Array.from(teamsByName.values());

	const customersByKey = new Map(
		rows.map((row, index) => {
			const customerKey = buildCustomerKey(row);

			return [
				customerKey,
				{
					id: deterministicUuid(`customer:${customerKey}`),
					name: sanitizeSeedName(row.customer_name),
					email: trimNullable(row.customer_email)?.toLowerCase() ?? null,
					phone: trimNullable(row.customer_phone),
					cpf: normalizeCustomerCpf(row.customer_cpf, index + 1),
				},
			];
		}),
	);

	const customers = Array.from(customersByKey.values());
	const customerIdByKey = new Map(
		Array.from(customersByKey.entries(), ([customerKey, customer]) => [
			customerKey,
			customer.id,
		]),
	);

	const leads = rows.map((row) => {
		const customerKey = buildCustomerKey(row);
		const leadId = deterministicUuid(`lead:${row.lead_id.trim()}`);
		const createdAt = parseDate(row.lead_created_at) ?? new Date();
		const updatedAt =
			parseDate(row.negotiation_updated_at) ??
			parseDate(row.first_interaction_at) ??
			createdAt;

		return {
			id: leadId,
			customerId:
				customerIdByKey.get(customerKey) ??
				deterministicUuid(`customer:${customerKey}`),
			storeId:
				storeIdByOriginalTeamName.get(row.team_name.trim()) ??
				deterministicUuid(`store:${row.team_name.trim()}`),
			ownerUserId:
				userIdByEmail.get(row.user_email.trim().toLowerCase()) ?? null,
			source: mapLeadSource(row.source),
			status: mapLeadStatus(row),
			createdAt,
			updatedAt,
		};
	});

	const deals = rows.map((row, index) => {
		const leadId = deterministicUuid(`lead:${row.lead_id.trim()}`);
		const vehicleId = deterministicUuid(`vehicle:${row.lead_id.trim()}`);
		const createdAt = parseDate(row.negotiation_created_at) ?? new Date();
		const updatedAt = parseDate(row.negotiation_updated_at) ?? createdAt;
		const isClosed = row.is_open.trim().toUpperCase() === 'FALSE';
		const lead = leads[index];
		const leadStatus = lead?.status;
		const closedAt = isClosed ? updatedAt : null;
		const status =
			closedAt === null
				? ('OPEN' as const)
				: leadStatus === 'CONVERTED'
					? ('WON' as const)
					: ('LOST' as const);

		return {
			id: deterministicUuid(`deal:${row.lead_id.trim()}`),
			leadId,
			vehicleId,
			title: row.subject.trim(),
			value: null,
			importance: 'WARM' as const,
			stage: 'NEGOTIATION' as const,
			status,
			closedAt,
			createdAt,
			updatedAt,
		};
	});

	const vehicles = leads.map((lead, index) => {
		const csvRow = rows[index];
		const deal = deals[index];
		const seed = `${lead.storeId}:${lead.id}:${deal?.id ?? index}`;
		const catalog = pickFrom(VEHICLE_CATALOG, seed);
		const modelYear = randomInt(2016, 2025, `${seed}:modelYear`);
		const manufactureYear = Math.max(
			2015,
			modelYear - randomInt(0, 1, `${seed}:manufactureDelta`),
		);
		const mileage =
			deal?.status === 'OPEN'
				? randomInt(1000, 95000, `${seed}:mileageOpen`)
				: randomInt(0, 135000, `${seed}:mileageClosed`);

		const status =
			deal?.status === 'OPEN'
				? VehicleStatus.RESERVED
				: deal?.status === 'WON'
					? VehicleStatus.SOLD
					: VehicleStatus.AVAILABLE;

		// Price: if CSV deal has null, create something plausible
		const priceBase = randomInt(42000, 180000, `${seed}:price`);
		const price = status === VehicleStatus.SOLD ? priceBase + 3000 : priceBase;

		return {
			id: deterministicUuid(`vehicle:${csvRow?.lead_id.trim() ?? lead.id}`),
			storeId: lead.storeId,
			brand: catalog.brand,
			model: catalog.model,
			version: catalog.version,
			modelYear,
			manufactureYear,
			color: pickFrom(VEHICLE_COLORS, `${seed}:color`),
			mileage,
			supportedFuelType: pickFrom(VEHICLE_FUEL_TYPES, `${seed}:fuel`),
			price,
			status,
			plate:
				randomInt(0, 100, `${seed}:plateChance`) < 65 ? buildPlate(seed) : null,
			vin: randomInt(0, 100, `${seed}:vinChance`) < 75 ? buildVin(seed) : null,
			createdAt: deal?.createdAt ?? lead.createdAt,
			updatedAt: deal?.updatedAt ?? lead.updatedAt,
		};
	});

	return {
		accessGroups: SYSTEM_ACCESS_GROUPS,
		teams,
		stores,
		users,
		customers,
		leads,
		vehicles,
		deals,
	};
}
