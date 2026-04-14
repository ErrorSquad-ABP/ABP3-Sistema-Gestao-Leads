import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	LeadSource,
	LeadStatus,
	UserRole,
} from '../../src/generated/prisma/enums.js';

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
					name: row.user_name.trim(),
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
		rows.map((row) => {
			const customerKey = buildCustomerKey(row);

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
		accessGroups: SYSTEM_ACCESS_GROUPS,
		teams,
		stores,
		users,
		customers,
		leads,
		deals,
	};
}
