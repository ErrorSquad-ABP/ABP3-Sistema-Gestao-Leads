import type { z } from 'zod';

import type {
	agendaItemSchema,
	agendaItemsResponseSchema,
	agendaLeadSummarySchema,
	agendaMetricsSchema,
} from '../schemas/agenda.schema';

type AgendaItem = z.infer<typeof agendaItemSchema>;
type AgendaItemsResponse = z.infer<typeof agendaItemsResponseSchema>;
type AgendaLeadSummary = z.infer<typeof agendaLeadSummarySchema>;
type AgendaMetrics = z.infer<typeof agendaMetricsSchema>;
type AgendaItemType = AgendaItem['type'];
type AgendaItemStatus = AgendaItem['status'];
type AgendaRecurrence = AgendaItem['recurrence'];

type AgendaItemsQuery = {
	from?: string;
	limit?: number;
	search?: string;
	status?: AgendaItemStatus;
	to?: string;
	type?: AgendaItemType;
};

type CreateAgendaItemPayload = {
	description?: string | null;
	dueAt?: string | null;
	endsAt?: string | null;
	leadId?: string | null;
	location?: string | null;
	recurrence?: AgendaRecurrence;
	startsAt?: string | null;
	title: string;
	type: AgendaItemType;
};

type UpdateAgendaItemPayload = Partial<CreateAgendaItemPayload> & {
	status?: AgendaItemStatus;
};

export type {
	AgendaItem,
	AgendaItemsQuery,
	AgendaItemsResponse,
	AgendaItemStatus,
	AgendaItemType,
	AgendaLeadSummary,
	AgendaMetrics,
	AgendaRecurrence,
	CreateAgendaItemPayload,
	UpdateAgendaItemPayload,
};
