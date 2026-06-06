import { ApiProperty } from '@nestjs/swagger';

import type { AgendaItem } from '../../domain/agenda-item.types.js';

class AgendaLeadSummaryDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	customerName!: string;

	@ApiProperty()
	status!: string;
}

class AgendaItemDto {
	@ApiProperty()
	id!: string;

	@ApiProperty({ enum: ['TASK', 'EVENT'] })
	type!: 'TASK' | 'EVENT';

	@ApiProperty({ enum: ['SCHEDULED', 'DONE', 'CANCELLED'] })
	status!: 'SCHEDULED' | 'DONE' | 'CANCELLED';

	@ApiProperty({ enum: ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'] })
	recurrence!: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

	@ApiProperty({ nullable: true, required: false })
	leadId?: string | null;

	@ApiProperty({ nullable: true, required: false, type: AgendaLeadSummaryDto })
	lead?: AgendaLeadSummaryDto | null;

	@ApiProperty()
	title!: string;

	@ApiProperty({ nullable: true, required: false })
	description?: string | null;

	@ApiProperty({ nullable: true, required: false })
	location?: string | null;

	@ApiProperty({ nullable: true, required: false })
	startsAt?: string | null;

	@ApiProperty({ nullable: true, required: false })
	endsAt?: string | null;

	@ApiProperty({ nullable: true, required: false })
	dueAt?: string | null;

	@ApiProperty()
	createdAt!: string;

	@ApiProperty()
	updatedAt!: string;

	static fromEntity(item: AgendaItem): AgendaItemDto {
		return {
			id: item.id,
			type: item.type,
			status: item.status,
			recurrence: item.recurrence,
			leadId: item.leadId,
			lead: item.lead ?? null,
			title: item.title,
			description: item.description,
			location: item.location,
			startsAt: item.startsAt?.toISOString() ?? null,
			endsAt: item.endsAt?.toISOString() ?? null,
			dueAt: item.dueAt?.toISOString() ?? null,
			createdAt: item.createdAt.toISOString(),
			updatedAt: item.updatedAt.toISOString(),
		};
	}
}

class AgendaItemsResponseDto {
	@ApiProperty({ isArray: true, type: AgendaItemDto })
	items!: AgendaItemDto[];
}

class AgendaMetricsDto {
	@ApiProperty()
	activitiesTodayCount!: number;

	@ApiProperty()
	completedThisMonthCount!: number;

	@ApiProperty()
	overdueCount!: number;

	@ApiProperty()
	pendingTasksCount!: number;
}

export { AgendaItemDto, AgendaItemsResponseDto, AgendaMetricsDto };
