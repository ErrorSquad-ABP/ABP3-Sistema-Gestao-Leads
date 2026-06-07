import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type {
	AgendaItem,
	AgendaItemListFilters,
	AgendaItemRepository,
	AgendaMetrics,
	CreateAgendaItemInput,
	LeadAccessSnapshot,
	UpdateAgendaItemInput,
} from '../../domain/agenda-item.types.js';

const AGENDA_ITEM_INCLUDE = {
	lead: {
		select: {
			id: true,
			status: true,
			customer: {
				select: {
					name: true,
				},
			},
		},
	},
} satisfies Prisma.AgendaItemInclude;

const AGENDA_ITEM_ORDER_BY: Prisma.AgendaItemOrderByWithRelationInput[] = [
	{ startsAt: 'asc' },
	{ dueAt: 'asc' },
	{ createdAt: 'desc' },
];

type AgendaItemRecord = Prisma.AgendaItemGetPayload<{
	include: typeof AGENDA_ITEM_INCLUDE;
}>;

@Injectable()
class AgendaPrismaRepository implements AgendaItemRepository {
	constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

	async list(filters: AgendaItemListFilters): Promise<AgendaItem[]> {
		const where: Prisma.AgendaItemWhereInput = {
			userId: filters.userId,
			...(filters.leadId ? { leadId: filters.leadId } : {}),
			...(filters.type ? { type: filters.type } : {}),
			...(filters.status ? { status: filters.status } : {}),
			...this.buildDateRangeWhere(filters),
			...this.buildSearchWhere(filters.search),
		};

		const items = await this.prisma.agendaItem.findMany({
			include: AGENDA_ITEM_INCLUDE,
			where,
			orderBy: AGENDA_ITEM_ORDER_BY,
			take: filters.limit,
		});
		return items.map(this.toAgendaItem);
	}

	async findByIdForUser(
		id: string,
		userId: string,
	): Promise<AgendaItem | null> {
		const item = await this.prisma.agendaItem.findFirst({
			include: AGENDA_ITEM_INCLUDE,
			where: { id, userId },
		});
		return item ? this.toAgendaItem(item) : null;
	}

	async create(input: CreateAgendaItemInput): Promise<AgendaItem> {
		const item = await this.prisma.agendaItem.create({
			data: input,
			include: AGENDA_ITEM_INCLUDE,
		});
		return this.toAgendaItem(item);
	}

	async update(input: UpdateAgendaItemInput): Promise<AgendaItem | null> {
		const { id, userId, ...data } = input;
		const current = await this.findByIdForUser(id, userId);
		if (!current) {
			return null;
		}
		const updated = await this.prisma.agendaItem.update({
			where: { id },
			data,
			include: AGENDA_ITEM_INCLUDE,
		});
		return this.toAgendaItem(updated);
	}

	async completeTaskForUser(
		id: string,
		userId: string,
	): Promise<AgendaItem | null> {
		const current = await this.findByIdForUser(id, userId);
		if (!current || current.type !== 'TASK') {
			return null;
		}
		const updated = await this.prisma.agendaItem.update({
			where: { id },
			data: { status: 'DONE' },
			include: AGENDA_ITEM_INCLUDE,
		});
		return this.toAgendaItem(updated);
	}

	async cancelForUser(id: string, userId: string): Promise<AgendaItem | null> {
		const current = await this.findByIdForUser(id, userId);
		if (!current) {
			return null;
		}
		const updated = await this.prisma.agendaItem.update({
			where: { id },
			data: { status: 'CANCELLED' },
			include: AGENDA_ITEM_INCLUDE,
		});
		return this.toAgendaItem(updated);
	}

	async findLeadAccessSnapshot(
		leadId: string,
	): Promise<LeadAccessSnapshot | null> {
		return this.prisma.lead.findUnique({
			where: { id: leadId },
			select: {
				ownerUserId: true,
				storeId: true,
			},
		});
	}

	async getMetrics(input: {
		now: Date;
		userId: string;
	}): Promise<AgendaMetrics> {
		const todayStart = new Date(input.now);
		todayStart.setHours(0, 0, 0, 0);
		const todayEnd = new Date(input.now);
		todayEnd.setHours(23, 59, 59, 999);
		const monthStart = new Date(input.now);
		monthStart.setDate(1);
		monthStart.setHours(0, 0, 0, 0);
		const monthEnd = new Date(monthStart);
		monthEnd.setMonth(monthEnd.getMonth() + 1);

		const [
			pendingTasksCount,
			activitiesTodayCount,
			overdueCount,
			completedThisMonthCount,
		] = await Promise.all([
			this.prisma.agendaItem.count({
				where: {
					userId: input.userId,
					type: 'TASK',
					status: 'SCHEDULED',
				},
			}),
			this.prisma.agendaItem.count({
				where: {
					userId: input.userId,
					status: { not: 'CANCELLED' },
					OR: [
						{ startsAt: { gte: todayStart, lte: todayEnd } },
						{ dueAt: { gte: todayStart, lte: todayEnd } },
					],
				},
			}),
			this.prisma.agendaItem.count({
				where: {
					userId: input.userId,
					status: 'SCHEDULED',
					OR: [
						{ type: 'TASK', dueAt: { lt: input.now } },
						{ type: 'EVENT', endsAt: { lt: input.now } },
						{
							type: 'EVENT',
							endsAt: null,
							startsAt: { lt: input.now },
						},
					],
				},
			}),
			this.prisma.agendaItem.count({
				where: {
					userId: input.userId,
					status: 'DONE',
					updatedAt: { gte: monthStart, lt: monthEnd },
				},
			}),
		]);

		return {
			activitiesTodayCount,
			completedThisMonthCount,
			overdueCount,
			pendingTasksCount,
		};
	}

	private buildDateRangeWhere(
		filters: AgendaItemListFilters,
	): Prisma.AgendaItemWhereInput {
		if (!filters.from && !filters.to) {
			return {};
		}

		const range = {
			...(filters.from ? { gte: filters.from } : {}),
			...(filters.to ? { lte: filters.to } : {}),
		};

		const recurringUntilRangeEnd = filters.to
			? {
					AND: [
						{ recurrence: { not: 'NONE' as const } },
						{
							OR: [
								{ startsAt: { lte: filters.to } },
								{ dueAt: { lte: filters.to } },
							],
						},
					],
				}
			: undefined;

		return {
			OR: [
				{ startsAt: range },
				{ dueAt: range },
				...(recurringUntilRangeEnd ? [recurringUntilRangeEnd] : []),
			],
		};
	}

	private buildSearchWhere(search?: string): Prisma.AgendaItemWhereInput {
		const normalizedSearch = search?.trim();
		if (!normalizedSearch) {
			return {};
		}
		return {
			OR: [
				{ title: { contains: normalizedSearch, mode: 'insensitive' } },
				{ description: { contains: normalizedSearch, mode: 'insensitive' } },
				{
					lead: {
						customer: {
							name: { contains: normalizedSearch, mode: 'insensitive' },
						},
					},
				},
			],
		};
	}

	private toAgendaItem(item: AgendaItemRecord): AgendaItem {
		return {
			id: item.id,
			userId: item.userId,
			leadId: item.leadId,
			lead: item.lead
				? {
						id: item.lead.id,
						customerName: item.lead.customer.name,
						status: item.lead.status,
					}
				: null,
			type: item.type,
			status: item.status,
			recurrence: item.recurrence,
			title: item.title,
			description: item.description,
			location: item.location,
			startsAt: item.startsAt,
			endsAt: item.endsAt,
			dueAt: item.dueAt,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
		};
	}
}

export { AgendaPrismaRepository };
