import {
	BadRequestException,
	Injectable,
	type PipeTransform,
} from '@nestjs/common';

import type {
	CustomerCatalogSort,
	CustomerCatalogStatus,
} from '../../domain/repositories/customer.repository.js';

const CUSTOMER_CATALOG_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
const CUSTOMER_CATALOG_SORTS = [
	'recent',
	'deals_desc',
	'value_desc',
	'name_asc',
] as const;

type ListCustomerCatalogRawQuery = {
	readonly search?: unknown;
	readonly storeId?: unknown;
	readonly status?: unknown;
	readonly sort?: unknown;
	readonly page?: unknown;
	readonly limit?: unknown;
};

type ListCustomerCatalogValidatedQuery = {
	readonly search?: string;
	readonly storeId?: string;
	readonly status?: CustomerCatalogStatus;
	readonly sort?: CustomerCatalogSort;
	readonly page?: number;
	readonly limit?: number;
};

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

function parseStatus(value: unknown): CustomerCatalogStatus | undefined {
	const status = parseOptionalString(value, 'status');
	if (!status) {
		return undefined;
	}
	if (status === 'ACTIVE' || status === 'INACTIVE') {
		return status;
	}
	throw new BadRequestException(
		`status deve ser um dos valores: ${CUSTOMER_CATALOG_STATUSES.join(', ')}.`,
	);
}

function parseSort(value: unknown): CustomerCatalogSort | undefined {
	const sort = parseOptionalString(value, 'sort');
	if (!sort) {
		return undefined;
	}
	if (
		sort === 'recent' ||
		sort === 'deals_desc' ||
		sort === 'value_desc' ||
		sort === 'name_asc'
	) {
		return sort;
	}
	throw new BadRequestException(
		`sort deve ser um dos valores: ${CUSTOMER_CATALOG_SORTS.join(', ')}.`,
	);
}

@Injectable()
class ListCustomerCatalogQueryValidator
	implements
		PipeTransform<
			ListCustomerCatalogRawQuery,
			ListCustomerCatalogValidatedQuery
		>
{
	transform(
		value: ListCustomerCatalogRawQuery,
	): ListCustomerCatalogValidatedQuery {
		return {
			search: parseOptionalString(value.search, 'search'),
			storeId: parseOptionalString(value.storeId, 'storeId'),
			status: parseStatus(value.status),
			sort: parseSort(value.sort),
			page: parseOptionalPositiveInt(value.page, 'page'),
			limit: parseOptionalPositiveInt(value.limit, 'limit'),
		};
	}
}

export { ListCustomerCatalogQueryValidator };
export type { ListCustomerCatalogValidatedQuery };
