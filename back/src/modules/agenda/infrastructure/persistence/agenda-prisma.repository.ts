import { Injectable } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';
// biome-ignore lint/style/useImportType: Nest DI usa PrismaService em metadados de runtime
import { PrismaService } from '../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type {
	AgendaItem,
	AgendaItemListFilters,
	AgendaItemRepository,
	CreateAgendaItemInput,
	UpdateAgendaItemInput,
} from '../../domain/agenda-item.types.js';

const AGENDA_ITEM_ORDER_BY: Prisma.AgendaItemOrderByWithRelationInput[] = [
	{ startsAt: 'asc' },
	{ dueAt: 'asc' },
	{ createdAt: 'desc' },
];

@Injectable()
class AgendaPrismaRepository implements AgendaItemRepository {
	constructor(private readonly prisma: PrismaService) {}

	async list(filters: AgendaItemListFilters): Promise<AgendaItem[]> {
		const where: Prisma.AgendaItemWhereInput = {
			userId: filters.userId,
			...(filters.type ? { type: filters.type } : {}),
			...(filters.status ? { status: filters.status } : {}),
			...this.buildDateRangeWhere(filters),
		};

		return this.prisma.agendaItem.findMany({
			where,
			orderBy: AGENDA_ITEM_ORDER_BY,
			take: filters.limit,
		});
	}

	async findByIdForUser(
		id: string,
		userId: string,
	): Promise<AgendaItem | null> {
		return this.prisma.agendaItem.findFirst({ where: { id, userId } });
	}

	async create(input: CreateAgendaItemInput): Promise<AgendaItem> {
		return this.prisma.agendaItem.create({ data: input });
	}

	async update(input: UpdateAgendaItemInput): Promise<AgendaItem | null> {
		const { id, userId, ...data } = input;
		const current = await this.findByIdForUser(id, userId);
		if (!current) {
			return null;
		}
		return this.prisma.agendaItem.update({ where: { id }, data });
	}

	async completeTaskForUser(
		id: string,
		userId: string,
	): Promise<AgendaItem | null> {
		const current = await this.findByIdForUser(id, userId);
		if (!current || current.type !== 'TASK') {
			return null;
		}
		return this.prisma.agendaItem.update({
			where: { id },
			data: { status: 'DONE' },
		});
	}

	async cancelForUser(id: string, userId: string): Promise<AgendaItem | null> {
		const current = await this.findByIdForUser(id, userId);
		if (!current) {
			return null;
		}
		return this.prisma.agendaItem.update({
			where: { id },
			data: { status: 'CANCELLED' },
		});
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
}

export { AgendaPrismaRepository };
