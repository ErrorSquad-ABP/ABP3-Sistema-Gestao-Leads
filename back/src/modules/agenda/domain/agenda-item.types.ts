type AgendaItemType = 'TASK' | 'EVENT';
type AgendaItemStatus = 'SCHEDULED' | 'DONE' | 'CANCELLED';
type AgendaRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

type AgendaLeadSummary = {
	id: string;
	customerName: string;
	status: string;
};

type AgendaItem = {
	id: string;
	userId: string;
	leadId: string | null;
	lead?: AgendaLeadSummary | null;
	type: AgendaItemType;
	status: AgendaItemStatus;
	recurrence: AgendaRecurrence;
	title: string;
	description: string | null;
	location: string | null;
	startsAt: Date | null;
	endsAt: Date | null;
	dueAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

type AgendaItemListFilters = {
	from?: Date;
	leadId?: string;
	limit?: number;
	search?: string;
	status?: AgendaItemStatus;
	to?: Date;
	type?: AgendaItemType;
	userId: string;
};

type AgendaMetrics = {
	activitiesTodayCount: number;
	completedThisMonthCount: number;
	overdueCount: number;
	pendingTasksCount: number;
};

type LeadAccessSnapshot = {
	ownerUserId: string | null;
	storeId: string;
};

type CreateAgendaItemInput = {
	description?: string | null;
	dueAt?: Date | null;
	endsAt?: Date | null;
	leadId?: string | null;
	location?: string | null;
	recurrence: AgendaRecurrence;
	startsAt?: Date | null;
	title: string;
	type: AgendaItemType;
	userId: string;
};

type UpdateAgendaItemInput = {
	description?: string | null;
	dueAt?: Date | null;
	endsAt?: Date | null;
	id: string;
	leadId?: string | null;
	location?: string | null;
	recurrence?: AgendaRecurrence;
	startsAt?: Date | null;
	status?: AgendaItemStatus;
	title?: string;
	type?: AgendaItemType;
	userId: string;
};

interface AgendaItemRepository {
	cancelForUser(id: string, userId: string): Promise<AgendaItem | null>;
	completeTaskForUser(id: string, userId: string): Promise<AgendaItem | null>;
	create(input: CreateAgendaItemInput): Promise<AgendaItem>;
	findByIdForUser(id: string, userId: string): Promise<AgendaItem | null>;
	findLeadAccessSnapshot(leadId: string): Promise<LeadAccessSnapshot | null>;
	getMetrics(input: { now: Date; userId: string }): Promise<AgendaMetrics>;
	list(filters: AgendaItemListFilters): Promise<AgendaItem[]>;
	update(input: UpdateAgendaItemInput): Promise<AgendaItem | null>;
}

export type {
	AgendaItem,
	AgendaLeadSummary,
	AgendaItemListFilters,
	AgendaMetrics,
	AgendaItemRepository,
	AgendaItemStatus,
	AgendaItemType,
	AgendaRecurrence,
	CreateAgendaItemInput,
	LeadAccessSnapshot,
	UpdateAgendaItemInput,
};
