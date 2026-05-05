import { z } from 'zod';

import { ApiError } from '@/lib/http/api-error';

const analyticDashboardFilterModeValues = [
	'week',
	'month',
	'year',
	'custom',
] as const;

const analyticDashboardScopeValues = [
	'attendant',
	'manager',
	'general_manager',
	'full',
] as const;

const analyticDashboardFilterSchema = z.object({
	mode: z.enum(analyticDashboardFilterModeValues),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	scope: z.enum(analyticDashboardScopeValues),
	top: z.number().int().min(1).nullable(),
});

const analyticDashboardSummarySchema = z.object({
	totalLeads: z.number().int().min(0),
	convertedLeads: z.number().int().min(0),
	notConvertedLeads: z.number().int().min(0),
	conversionRate: z.number().min(0),
});

const analyticDashboardPerformanceItemSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	totalLeads: z.number().int().min(0),
	convertedLeads: z.number().int().min(0),
	notConvertedLeads: z.number().int().min(0),
	conversionRate: z.number().min(0),
	openDeals: z.number().int().min(0),
	wonDeals: z.number().int().min(0),
	lostDeals: z.number().int().min(0),
});

const analyticDashboardDistributionItemSchema = z.object({
	key: z.string().min(1),
	label: z.string().min(1),
	count: z.number().int().min(0),
});

const analyticDashboardAverageTimeSchema = z.object({
	hours: z.number().min(0).nullable(),
	leadsWithInteraction: z.number().int().min(0),
	isApproximate: z.boolean(),
	methodology: z.string().min(1),
});

const analyticDashboardSchema = z.object({
	filter: analyticDashboardFilterSchema,
	summary: analyticDashboardSummarySchema,
	byAttendant: z.array(analyticDashboardPerformanceItemSchema),
	byTeam: z.array(analyticDashboardPerformanceItemSchema),
	importanceDistribution: z.array(analyticDashboardDistributionItemSchema),
	finalizationReasons: z.array(analyticDashboardDistributionItemSchema),
	averageTimeToFirstInteraction: analyticDashboardAverageTimeSchema,
});

function parseAnalyticDashboardResponse(data: unknown) {
	const parsed = analyticDashboardSchema.safeParse(data);
	if (!parsed.success) {
		throw new ApiError('Resposta da API em formato inesperado.', 502, {
			code: 'analytic-dashboard.invalid_response_shape',
		});
	}
	return parsed.data;
}

export {
	analyticDashboardFilterModeValues,
	analyticDashboardSchema,
	parseAnalyticDashboardResponse,
};
