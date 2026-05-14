import {
	BadRequestException,
	Injectable,
	type PipeTransform,
} from '@nestjs/common';

import type {
	LeadCatalogSort,
	LeadCatalogSource,
	LeadCatalogStatus,
} from '../../domain/repositories/lead.repository.js';

const LEAD_CATALOG_STATUSES = [
	'NEW',
	'CONTACTED',
	'QUALIFIED',
	'NEGOTIATING',
	'CONVERTED',
	'LOST',
] as const;

const LEAD_CATALOG_SOURCES = [
	'WEBSITE',
	'WHATSAPP',
	'PHONE',
	'WALK_IN',
	'INDICATION',
	'OTHER',
	'INSTAGRAM',
	'FACEBOOK',
	'MERCADO_LIVRE',
] as const;

const LEAD_CATALOG_SORTS = [
	'recent',
	'last_activity',
	'status',
	'source',
] as const;

const SOURCE_ALIAS = new Map<string, LeadCatalogSource>([
	['DIGITAL_FORM', 'WEBSITE'],
	['FORM', 'WEBSITE'],
	['PHONE_CALL', 'PHONE'],
	['STORE_VISIT', 'WALK_IN'],
	['VISIT', 'WALK_IN'],
]);

type ListLeadCatalogRawQuery = {
	readonly search?: unknown;
	readonly status?: unknown;
	readonly source?: unknown;
	readonly storeId?: unknown;
	readonly ownerUserId?: unknown;
	readonly activityStartDate?: unknown;
	readonly activityEndDate?: unknown;
	readonly sort?: unknown;
	readonly page?: unknown;
	readonly limit?: unknown;
};

type ListLeadCatalogValidatedQuery = {
	readonly search?: string;
	readonly status?: LeadCatalogStatus;
	readonly source?: LeadCatalogSource;
	readonly storeId?: string;
	readonly ownerUserId?: string;
	readonly activityStartDate?: Date;
	readonly activityEndDate?: Date;
	readonly sort?: LeadCatalogSort;
	readonly page?: number;
	readonly limit?: number;
};

function normalizeToken(value: string): string {
	return value
		.trim()
		.replace(/[\s-]+/g, '_')
		.toUpperCase();
}

function parseOptionalString(
	value: unknown,
	field: string,
): string | undefined {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}
	if (typeof value !== 'string') {
		throw new BadRequestException(`${field} deve ser uma string.`);
	}
	const normalized = value.trim();
	return normalized ? normalized : undefined;
}

function parseOptionalPositiveInt(
	value: unknown,
	field: string,
): number | undefined {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}
	if (typeof value !== 'string' && typeof value !== 'number') {
		throw new BadRequestException(`${field} deve ser numérico.`);
	}
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 1) {
		throw new BadRequestException(`${field} deve ser inteiro positivo.`);
	}
	return parsed;
}

function parseOptionalDate(value: unknown, field: string): Date | undefined {
	const raw = parseOptionalString(value, field);
	if (!raw) {
		return undefined;
	}
	const parsed = new Date(raw);
	if (Number.isNaN(parsed.getTime())) {
		throw new BadRequestException(`${field} deve ser uma data válida.`);
	}
	return parsed;
}

function parseOptionalEndDate(value: unknown, field: string): Date | undefined {
	const parsed = parseOptionalDate(value, field);
	if (!parsed) {
		return undefined;
	}
	const endOfDay = new Date(parsed);
	endOfDay.setUTCHours(23, 59, 59, 999);
	return endOfDay;
}

function parseStatus(value: unknown): LeadCatalogStatus | undefined {
	const raw = parseOptionalString(value, 'status');
	if (!raw) {
		return undefined;
	}
	const status = normalizeToken(raw);
	if (LEAD_CATALOG_STATUSES.includes(status as LeadCatalogStatus)) {
		return status as LeadCatalogStatus;
	}
	throw new BadRequestException(
		`status deve ser um dos valores: ${LEAD_CATALOG_STATUSES.join(', ')}.`,
	);
}

function parseSource(value: unknown): LeadCatalogSource | undefined {
	const raw = parseOptionalString(value, 'source');
	if (!raw) {
		return undefined;
	}
	const normalized = normalizeToken(raw);
	const source = SOURCE_ALIAS.get(normalized) ?? normalized;
	if (LEAD_CATALOG_SOURCES.includes(source as LeadCatalogSource)) {
		return source as LeadCatalogSource;
	}
	throw new BadRequestException(
		`source deve ser um dos valores: ${LEAD_CATALOG_SOURCES.join(', ')}.`,
	);
}

function parseSort(value: unknown): LeadCatalogSort | undefined {
	const sort = parseOptionalString(value, 'sort');
	if (!sort) {
		return undefined;
	}
	if (LEAD_CATALOG_SORTS.includes(sort as LeadCatalogSort)) {
		return sort as LeadCatalogSort;
	}
	throw new BadRequestException(
		`sort deve ser um dos valores: ${LEAD_CATALOG_SORTS.join(', ')}.`,
	);
}

@Injectable()
class ListLeadCatalogQueryValidator
	implements
		PipeTransform<ListLeadCatalogRawQuery, ListLeadCatalogValidatedQuery>
{
	transform(value: ListLeadCatalogRawQuery): ListLeadCatalogValidatedQuery {
		return {
			search: parseOptionalString(value.search, 'search'),
			status: parseStatus(value.status),
			source: parseSource(value.source),
			storeId: parseOptionalString(value.storeId, 'storeId'),
			ownerUserId: parseOptionalString(value.ownerUserId, 'ownerUserId'),
			activityStartDate: parseOptionalDate(
				value.activityStartDate,
				'activityStartDate',
			),
			activityEndDate: parseOptionalEndDate(
				value.activityEndDate,
				'activityEndDate',
			),
			sort: parseSort(value.sort),
			page: parseOptionalPositiveInt(value.page, 'page'),
			limit: parseOptionalPositiveInt(value.limit, 'limit'),
		};
	}
}

export { ListLeadCatalogQueryValidator };
export type { ListLeadCatalogValidatedQuery };
