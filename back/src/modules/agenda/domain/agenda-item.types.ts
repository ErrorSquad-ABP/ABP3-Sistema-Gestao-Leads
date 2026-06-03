type AgendaItemType = 'TASK' | 'EVENT';
type AgendaItemStatus = 'SCHEDULED' | 'DONE' | 'CANCELLED';
type AgendaRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

type AgendaItem = {
	id: string;
	userId: string;
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
	limit?: number;
	status?: AgendaItemStatus;
	to?: Date;
	type?: AgendaItemType;
	userId: string;
};

type CreateAgendaItemInput = {
	description?: string | null;
	dueAt?: Date | null;
	endsAt?: Date | null;
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
	list(filters: AgendaItemListFilters): Promise<AgendaItem[]>;
	update(input: UpdateAgendaItemInput): Promise<AgendaItem | null>;
}

export type {
	AgendaItem,
	AgendaItemListFilters,
	AgendaItemRepository,
	AgendaItemStatus,
	AgendaItemType,
	AgendaRecurrence,
	CreateAgendaItemInput,
	UpdateAgendaItemInput,
};
