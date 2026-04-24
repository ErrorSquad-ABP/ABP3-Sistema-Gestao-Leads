import { z } from 'zod';

const analyticsPeriodModeSchema = z.enum(['week', 'month', 'year', 'custom']);

const analyticsResolvedPeriodSchema = z.object({
	period: analyticsPeriodModeSchema,
	startDate: z.string().min(1),
	endDate: z.string().min(1),
	referenceDate: z.string().min(1),
});

const analyticsSummarySchema = z.object({
	totalLeads: z.number().int().nonnegative(),
	convertedLeads: z.number().int().nonnegative(),
	nonConvertedLeads: z.number().int().nonnegative(),
	conversionRate: z.number().nonnegative(),
	averageTimeToFirstDealHours: z.number().nonnegative().nullable(),
});

const analyticsComparisonSchema = z.object({
	converted: z.number().int().nonnegative(),
	nonConverted: z.number().int().nonnegative(),
});

const analyticsPerformanceItemSchema = z.object({
	entityId: z.string().uuid().nullable(),
	entityName: z.string().min(1),
	teamId: z.string().uuid().nullable(),
	teamName: z.string().min(1).nullable(),
	totalLeads: z.number().int().nonnegative(),
	convertedLeads: z.number().int().nonnegative(),
	nonConvertedLeads: z.number().int().nonnegative(),
	conversionRate: z.number().nonnegative(),
});

const analyticsDistributionItemSchema = z.object({
	key: z.string().min(1),
	label: z.string().min(1),
	totalLeads: z.number().int().nonnegative(),
	percentage: z.number().nonnegative(),
});

const analyticsDashboardSchema = z.object({
	period: analyticsResolvedPeriodSchema,
	summary: analyticsSummarySchema,
	convertedVsNonConverted: analyticsComparisonSchema,
	byAttendant: z.array(analyticsPerformanceItemSchema),
	byTeam: z.array(analyticsPerformanceItemSchema),
	byImportance: z.array(analyticsDistributionItemSchema),
	closeReasons: z.array(analyticsDistributionItemSchema),
});

export { analyticsDashboardSchema, analyticsPeriodModeSchema };
