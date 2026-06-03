import { z } from 'zod';

const agendaItemSchema = z.object({
	id: z.string().min(1),
	type: z.enum(['TASK', 'EVENT']),
	status: z.enum(['SCHEDULED', 'DONE', 'CANCELLED']),
	recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
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

function parseAgendaItemsResponse(payload: unknown) {
	return agendaItemsResponseSchema.parse(payload);
}

function parseAgendaItemResponse(payload: unknown) {
	return agendaItemSchema.parse(payload);
}

export {
	agendaItemSchema,
	agendaItemsResponseSchema,
	parseAgendaItemResponse,
	parseAgendaItemsResponse,
};
