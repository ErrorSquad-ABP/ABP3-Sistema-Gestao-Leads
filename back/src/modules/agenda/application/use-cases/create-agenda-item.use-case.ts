import { Inject, Injectable } from '@nestjs/common';

import { AgendaItemDto } from '../dto/agenda-item.dto.js';
import {
	normalizeOptionalText,
	normalizeRecurrence,
	normalizeRequiredTitle,
	validateAgendaItemDates,
} from './agenda-item-validation.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type {
	AgendaItemRepository,
	AgendaItemType,
	AgendaRecurrence,
} from '../../domain/agenda-item.types.js';

type CreateAgendaItemUseCaseInput = {
	description?: string | null;
	dueAt?: Date | null;
	endsAt?: Date | null;
	location?: string | null;
	recurrence?: AgendaRecurrence;
	startsAt?: Date | null;
	title: string;
	type: AgendaItemType;
	userId: string;
};

@Injectable()
class CreateAgendaItemUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
	) {}

	async execute(input: CreateAgendaItemUseCaseInput): Promise<AgendaItemDto> {
		validateAgendaItemDates(input);

		const item = await this.agendaItems.create({
			userId: input.userId,
			type: input.type,
			title: normalizeRequiredTitle(input.title),
			description: normalizeOptionalText(input.description),
			location: normalizeOptionalText(input.location),
			recurrence: normalizeRecurrence(input.recurrence),
			startsAt: input.startsAt ?? null,
			endsAt: input.endsAt ?? null,
			dueAt: input.dueAt ?? null,
		});

		return AgendaItemDto.fromEntity(item);
	}
}

export { CreateAgendaItemUseCase };
export type { CreateAgendaItemUseCaseInput };
