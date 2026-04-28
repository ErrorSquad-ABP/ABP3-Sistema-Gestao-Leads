import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const distributionItemSchema = z.object({
	key: z.string().min(1),
	count: z.number().int().min(0),
	percentage: z.number().min(0).max(100),
});

const storeDistributionItemSchema = z.object({
	storeId: z.string().uuid(),
	storeName: z.string().min(1),
	count: z.number().int().min(0),
	percentage: z.number().min(0).max(100),
});

const operationalDashboardDataSchema = z.object({
	period: z.object({
		startDate: z.string().datetime(),
		endDate: z.string().datetime(),
		days: z.number().int().min(1),
	}),
	scope: z.object({
		role: z.enum(['ADMINISTRATOR', 'MANAGER', 'GENERAL_MANAGER']),
		storeIds: z.array(z.string().uuid()).nullable(),
	}),
	totals: z.object({
		totalLeads: z.number().int().min(0),
		totalLeadsWithOpenDeal: z.number().int().min(0),
	}),
	distributions: z.object({
		byStatus: z.array(distributionItemSchema),
		bySource: z.array(distributionItemSchema),
		byStore: z.array(storeDistributionItemSchema),
		byImportance: z.array(distributionItemSchema),
	}),
});

function parseOperationalDashboardResponse(data: unknown) {
	const parsed = operationalDashboardDataSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'dashboard.operational.invalid_response_shape',
		});
	}
	return parsed.data;
}

export { operationalDashboardDataSchema, parseOperationalDashboardResponse };
