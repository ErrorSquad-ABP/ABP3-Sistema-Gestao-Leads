import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

/** Resposta `data` de listagens paginadas de leads. */
const leadListItemSchema = z.object({
	id: z.string().uuid(),
	customerId: z.string().uuid(),
	storeId: z.string().uuid(),
	ownerUserId: z.string().uuid().nullable(),
	source: z.string(),
	status: z.string(),
});

const leadListPagedDataSchema = z.object({
	items: z.array(leadListItemSchema),
	page: z.number().int().min(1),
	limit: z.number().int().min(1).max(10),
	total: z.number().int().min(0),
	totalPages: z.number().int().min(0),
});

const leadCatalogItemSchema = z.object({
	lead: leadListItemSchema,
	customer: z.object({
		id: z.string().uuid(),
		name: z.string(),
		email: z.string().email().nullable(),
		phone: z.string().nullable(),
		cpf: z.string().nullable(),
	}),
	store: z.object({
		id: z.string().uuid(),
		name: z.string(),
	}),
	owner: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			email: z.string().email(),
		})
		.nullable(),
	lastActivityAt: z.coerce.date().nullable(),
	lastActivityLabel: z.string(),
	openDealsCount: z.number().int().min(0),
	totalDealsCount: z.number().int().min(0),
	hasInteraction: z.boolean(),
});

const leadCatalogBreakdownItemSchema = z.object({
	label: z.string(),
	count: z.number().int().min(0),
});

const leadCatalogSchema = z.object({
	items: z.array(leadCatalogItemSchema),
	summary: z.object({
		total: z.number().int().min(0),
		withInteraction: z.number().int().min(0),
		converted: z.number().int().min(0),
		staleNoContact: z.number().int().min(0),
		conversionRate: z.number().int().min(0),
		wonValue: z.string().default('0.00'),
	}),
	funnel: z.object({
		totalLeads: z.number().int().min(0),
		withInteraction: z.number().int().min(0),
		openDeals: z.number().int().min(0),
		converted: z.number().int().min(0),
	}),
	origins: z.array(leadCatalogBreakdownItemSchema),
	page: z.number().int().min(1),
	limit: z.number().int().min(1).max(50),
	total: z.number().int().min(0),
	totalPages: z.number().int().min(0),
});

function parseLeadListPagedResponse(data: unknown) {
	const parsed = leadListPagedDataSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'leads.invalid_response_shape',
		});
	}
	return parsed.data;
}

function parseLeadCatalogResponse(data: unknown) {
	const parsed = leadCatalogSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta de leads em formato inesperado.', 502, {
			code: 'leads.invalid_catalog_response_shape',
		});
	}
	return parsed.data;
}

export {
	leadCatalogSchema,
	leadCatalogItemSchema,
	leadListItemSchema,
	leadListPagedDataSchema,
	parseLeadCatalogResponse,
	parseLeadListPagedResponse,
};
