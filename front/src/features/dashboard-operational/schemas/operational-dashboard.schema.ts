import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

import type { OperationalDashboardData } from '../model/operational-dashboard.model';

const statusKeySchema = z.enum([
	'NEW',
	'CONTACTED',
	'QUALIFIED',
	'DISQUALIFIED',
	'CONVERTED',
]);

const sourceKeySchema = z.enum([
	'store-visit',
	'phone-call',
	'whatsapp',
	'instagram',
	'facebook',
	'mercado-livre',
	'indication',
	'digital-form',
	'other',
]);

const importanceKeySchema = z.enum(['COLD', 'WARM', 'HOT']);

const baseDistributionItemSchema = z.object({
	count: z.number().int().min(0),
	percentage: z.number().min(0).max(100),
});

const statusDistributionItemSchema = baseDistributionItemSchema.extend({
	key: statusKeySchema,
});

const sourceDistributionItemSchema = baseDistributionItemSchema.extend({
	key: sourceKeySchema,
});

const importanceDistributionItemSchema = baseDistributionItemSchema.extend({
	key: importanceKeySchema,
});

const storeDistributionItemSchema = z.object({
	storeId: z.string().uuid(),
	storeName: z.string().min(1),
	count: z.number().int().min(0),
	percentage: z.number().min(0).max(100),
});

const operationalDashboardKpiSchema = z.object({
	value: z.number().min(0),
	previousValue: z.number().min(0),
	delta: z.number(),
	deltaPercentage: z.number().nullable(),
	deltaPoints: z.number().nullable(),
});

const operationalDashboardTrendPointSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	totalLeads: z.number().int().min(0),
	activeLeads: z.number().int().min(0),
	convertedLeads: z.number().int().min(0),
	conversionRate: z.number().min(0).max(100),
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
	kpis: z.object({
		totalLeads: operationalDashboardKpiSchema,
		activeLeads: operationalDashboardKpiSchema,
		convertedLeads: operationalDashboardKpiSchema,
		conversionRate: operationalDashboardKpiSchema,
	}),
	distributions: z.object({
		byStatus: z.array(statusDistributionItemSchema),
		bySource: z.array(sourceDistributionItemSchema),
		byStore: z.array(storeDistributionItemSchema),
		byImportance: z.array(importanceDistributionItemSchema),
	}),
	trend: z.object({
		points: z.array(operationalDashboardTrendPointSchema),
	}),
});

function parseOperationalDashboardResponse(
	data: unknown,
): OperationalDashboardData {
	const parsed = operationalDashboardDataSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'dashboard.operational.invalid_response_shape',
		});
	}
	return parsed.data;
}

export { operationalDashboardDataSchema, parseOperationalDashboardResponse };
