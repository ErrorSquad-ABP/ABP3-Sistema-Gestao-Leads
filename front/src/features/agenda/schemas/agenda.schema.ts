import { z } from 'zod';

const agendaLeadSummarySchema = z.object({
	id: z.string().uuid(),
	customerName: z.string().min(1),
	status: z.string().min(1),
});

const agendaOwnerSummarySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	email: z.string().email(),
});

const agendaItemSchema = z.object({
	id: z.string().min(1),
	type: z.enum(['TASK', 'EVENT']),
	status: z.enum(['SCHEDULED', 'DONE', 'CANCELLED']),
	recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
	leadId: z.string().uuid().nullable().optional(),
	lead: agendaLeadSummarySchema.nullable().optional(),
	owner: agendaOwnerSummarySchema.nullable().optional(),
	title: z.string().min(1),
	description: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	startsAt: z.string().nullable().optional(),
	endsAt: z.string().nullable().optional(),
	dueAt: z.string().nullable().optional(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

const agendaItemsResponseSchema = z.object({
	items: z.array(agendaItemSchema),
});

const agendaMetricsSchema = z.object({
	activitiesTodayCount: z.number().int().min(0),
	completedThisMonthCount: z.number().int().min(0),
	overdueCount: z.number().int().min(0),
	pendingTasksCount: z.number().int().min(0),
});

function parseAgendaItemsResponse(payload: unknown) {
	return agendaItemsResponseSchema.parse(payload);
}

function parseAgendaItemResponse(payload: unknown) {
	return agendaItemSchema.parse(payload);
}

function parseAgendaMetricsResponse(payload: unknown) {
	return agendaMetricsSchema.parse(payload);
}

export {
	agendaLeadSummarySchema,
	agendaOwnerSummarySchema,
	agendaItemSchema,
	agendaItemsResponseSchema,
	agendaMetricsSchema,
	parseAgendaItemResponse,
	parseAgendaItemsResponse,
	parseAgendaMetricsResponse,
};
