import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const customerStatusValues = ['ACTIVE', 'INACTIVE'] as const;
const customerCatalogSorts = [
	'recent',
	'deals_desc',
	'value_desc',
	'name_asc',
] as const;

const customerSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email().nullable(),
	phone: z.string().nullable(),
	cpf: z.string().nullable(),
});

const customerCatalogItemSchema = z.object({
	customer: customerSchema,
	primaryStoreName: z.string().nullable(),
	leadCount: z.number().int(),
	openDealsCount: z.number().int(),
	wonDealsCount: z.number().int(),
	totalDealsCount: z.number().int(),
	totalDealValue: z.string(),
	lastActivityAt: z.coerce.date().nullable(),
	lastActivityLabel: z.string(),
	status: z.enum(customerStatusValues),
	source: z.string().nullable(),
});

const customerCatalogBreakdownItemSchema = z.object({
	label: z.string(),
	count: z.number().int(),
});

const customerCatalogSchema = z.object({
	items: z.array(customerCatalogItemSchema),
	summary: z.object({
		total: z.number().int(),
		withDeals: z.number().int(),
		active: z.number().int(),
		retentionRate: z.number().int(),
	}),
	origins: z.array(customerCatalogBreakdownItemSchema),
	locations: z.array(customerCatalogBreakdownItemSchema),
	highlights: z.array(customerCatalogItemSchema),
	page: z.number().int(),
	limit: z.number().int(),
	total: z.number().int(),
	totalPages: z.number().int(),
});

function parseCustomerCatalogResponse(data: unknown) {
	const parsed = customerCatalogSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta de clientes em formato inesperado.', 502, {
			code: 'customers.invalid_catalog_response_shape',
		});
	}
	return parsed.data;
}

export {
	customerCatalogSchema,
	customerCatalogSorts,
	customerSchema,
	customerStatusValues,
	parseCustomerCatalogResponse,
};
