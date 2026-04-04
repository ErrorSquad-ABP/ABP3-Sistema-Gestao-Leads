import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as argon2 from 'argon2';

import type {
	Customer,
	Deal,
	Lead,
	Store,
	Team,
	User,
} from '../../src/generated/prisma/client.js';
import {
	LeadSource,
	LeadStatus,
	UserRole,
} from '../../src/shared/constants/enums.js';

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

type SeedDataset = {
	teams: Array<Pick<Team, 'id' | 'name'>>;
	stores: Array<Pick<Store, 'id' | 'name'>>;
	users: Array<
		Pick<User, 'id' | 'name' | 'email' | 'password' | 'role' | 'teamId'>
	>;
	customers: Array<Pick<Customer, 'id' | 'name' | 'email' | 'phone' | 'cpf'>>;
	leads: Array<
		Pick<
			Lead,
			| 'id'
			| 'customerId'
			| 'storeId'
			| 'ownerUserId'
			| 'source'
			| 'status'
			| 'createdAt'
			| 'updatedAt'
		>
	>;
	deals: Array<
		Pick<
			Deal,
			| 'id'
			| 'leadId'
			| 'title'
			| 'value'
			| 'closedAt'
			| 'createdAt'
			| 'updatedAt'
		>
	>;
};

const CSV_FILE_PATH = resolve(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'data',
	'dados_dashboard_ficticios.csv',
);

const DEFAULT_PASSWORD = '123456';
const SUPPORT_USERS = [
	{
		email: 'admin@crm.com',
		name: 'Administrador',
		role: UserRole.ADMIN,
		teamId: null,
	},
	{
		email: 'geral@crm.com',
		name: 'Gerente Geral',
		role: UserRole.GENERAL_MANAGER,
		teamId: null,
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

function deterministicUuid(seed: string) {
	const hash = createHash('sha256').update(seed).digest('hex');
	const timeLow = hash.slice(0, 8);
	const timeMid = hash.slice(8, 12);
	const timeHigh = `4${hash.slice(13, 16)}`;
	const variant = ['8', '9', 'a', 'b'][
		Number.parseInt(hash[16] ?? '0', 16) % 4
	];
	const clockSeq = `${variant}${hash.slice(17, 20)}`;
	const node = hash.slice(20, 32);

	return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`;
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

async function hashPassword(plainPassword: string) {
	return argon2.hash(plainPassword, {
		type: argon2.argon2id,
		memoryCost: 19456,
		timeCost: 2,
		parallelism: 1,
	});
}

export async function buildDashboardCsvSeed(): Promise<SeedDataset> {
	const csvContent = await readFile(CSV_FILE_PATH, 'utf-8');
	const rows = parseCsv(csvContent);
	const passwordHash = await hashPassword(DEFAULT_PASSWORD);

	const teams = Array.from(
		new Set(rows.map((row) => row.team_name.trim())),
	).map((teamName) => ({
		id: deterministicUuid(`team:${teamName}`),
		name: teamName,
	}));

	const stores = teams.map((team) => ({
		id: deterministicUuid(`store:${team.name}`),
		name: buildStoreName(team.name),
	}));

	const teamIdByName = new Map(teams.map((team) => [team.name, team.id]));
	const storeIdByTeamName = new Map(
		teams.map((team, index) => [team.name, stores[index]?.id ?? '']),
	);

	const csvUsers = Array.from(
		new Map(
			rows.map((row) => [
				row.user_email.trim().toLowerCase(),
				{
					id: deterministicUuid(`user:${row.user_email.trim().toLowerCase()}`),
					name: row.user_name.trim(),
					email: row.user_email.trim().toLowerCase(),
					password: passwordHash,
					role: UserRole.ATTENDANT,
					teamId: teamIdByName.get(row.team_name.trim()) ?? null,
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
			teamId: user.teamId,
		})),
		...csvUsers,
	];

	const userIdByEmail = new Map(users.map((user) => [user.email, user.id]));

	const customers = Array.from(
		new Map(
			rows.map((row) => {
				const customerKey =
					trimNullable(row.customer_cpf) ??
					trimNullable(row.customer_email)?.toLowerCase() ??
					`lead:${row.lead_id.trim()}`;

				return [
					customerKey,
					{
						id: deterministicUuid(`customer:${customerKey}`),
						name: row.customer_name.trim(),
						email: trimNullable(row.customer_email)?.toLowerCase() ?? null,
						phone: trimNullable(row.customer_phone),
						cpf: trimNullable(row.customer_cpf),
					},
				];
			}),
		).values(),
	);

	const customerIdByKey = new Map(
		customers.map((customer) => [
			customer.cpf ?? customer.email ?? '',
			customer.id,
		]),
	);

	const leads = rows.map((row) => {
		const customerKey =
			trimNullable(row.customer_cpf) ??
			trimNullable(row.customer_email)?.toLowerCase() ??
			'';
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
				deterministicUuid(`customer:fallback:${row.lead_id.trim()}`),
			storeId:
				storeIdByTeamName.get(row.team_name.trim()) ??
				deterministicUuid(`store:${row.team_name.trim()}`),
			ownerUserId:
				userIdByEmail.get(row.user_email.trim().toLowerCase()) ?? null,
			source: mapLeadSource(row.source),
			status: mapLeadStatus(row),
			createdAt,
			updatedAt,
		};
	});

	const deals = rows.map((row) => {
		const leadId = deterministicUuid(`lead:${row.lead_id.trim()}`);
		const createdAt = parseDate(row.negotiation_created_at) ?? new Date();
		const updatedAt = parseDate(row.negotiation_updated_at) ?? createdAt;
		const isClosed = row.is_open.trim().toUpperCase() === 'FALSE';

		return {
			id: deterministicUuid(`deal:${row.lead_id.trim()}`),
			leadId,
			title: row.subject.trim(),
			value: null,
			closedAt: isClosed ? updatedAt : null,
			createdAt,
			updatedAt,
		};
	});

	return {
		teams,
		stores,
		users,
		customers,
		leads,
		deals,
	};
}
