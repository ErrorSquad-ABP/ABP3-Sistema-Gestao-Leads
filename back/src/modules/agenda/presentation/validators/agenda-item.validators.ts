import { Type } from 'class-transformer';
import {
	IsDate,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
} from 'class-validator';

const AGENDA_ITEM_TYPES = ['TASK', 'EVENT'] as const;
const AGENDA_ITEM_STATUSES = ['SCHEDULED', 'DONE', 'CANCELLED'] as const;
const AGENDA_RECURRENCES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'] as const;
const AGENDA_MAX_LIMIT = 100;

class ListAgendaItemsQueryValidator {
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	from?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	to?: Date;

	@IsOptional()
	@IsEnum(AGENDA_ITEM_TYPES)
	type?: (typeof AGENDA_ITEM_TYPES)[number];

	@IsOptional()
	@IsEnum(AGENDA_ITEM_STATUSES)
	status?: (typeof AGENDA_ITEM_STATUSES)[number];

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(AGENDA_MAX_LIMIT)
	limit?: number;

	@IsOptional()
	@IsString()
	@MaxLength(120)
	search?: string;
}

class CreateAgendaItemValidator {
	@IsEnum(AGENDA_ITEM_TYPES)
	type!: (typeof AGENDA_ITEM_TYPES)[number];

	@IsString()
	@MaxLength(120)
	title!: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	description?: string | null;

	@IsOptional()
	@IsString()
	@MaxLength(160)
	location?: string | null;

	@IsOptional()
	@IsEnum(AGENDA_RECURRENCES)
	recurrence?: (typeof AGENDA_RECURRENCES)[number];

	@IsOptional()
	@IsUUID()
	leadId?: string | null;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startsAt?: Date | null;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	endsAt?: Date | null;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	dueAt?: Date | null;
}

class UpdateAgendaItemValidator {
	@IsOptional()
	@IsEnum(AGENDA_ITEM_TYPES)
	type?: (typeof AGENDA_ITEM_TYPES)[number];

	@IsOptional()
	@IsEnum(AGENDA_ITEM_STATUSES)
	status?: (typeof AGENDA_ITEM_STATUSES)[number];

	@IsOptional()
	@IsString()
	@MaxLength(120)
	title?: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	description?: string | null;

	@IsOptional()
	@IsString()
	@MaxLength(160)
	location?: string | null;

	@IsOptional()
	@IsEnum(AGENDA_RECURRENCES)
	recurrence?: (typeof AGENDA_RECURRENCES)[number];

	@IsOptional()
	@IsUUID()
	leadId?: string | null;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startsAt?: Date | null;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	endsAt?: Date | null;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	dueAt?: Date | null;
}

export {
	CreateAgendaItemValidator,
	ListAgendaItemsQueryValidator,
	UpdateAgendaItemValidator,
};
