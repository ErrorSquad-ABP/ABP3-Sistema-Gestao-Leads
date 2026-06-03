import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AgendaItemDto } from '../dto/agenda-item.dto.js';
import {
	normalizeOptionalText,
	normalizeRequiredTitle,
	validateAgendaItemDates,
} from './agenda-item-validation.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type {
	AgendaItemRepository,
	AgendaItemStatus,
	AgendaItemType,
	AgendaRecurrence,
} from '../../domain/agenda-item.types.js';

type UpdateAgendaItemUseCaseInput = {
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

@Injectable()
class UpdateAgendaItemUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
	) {}

	async execute(input: UpdateAgendaItemUseCaseInput): Promise<AgendaItemDto> {
		const current = await this.agendaItems.findByIdForUser(
			input.id,
			input.userId,
		);
		if (!current) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}

		const merged = {
			type: input.type ?? current.type,
			startsAt:
				input.startsAt !== undefined ? input.startsAt : current.startsAt,
			endsAt: input.endsAt !== undefined ? input.endsAt : current.endsAt,
			dueAt: input.dueAt !== undefined ? input.dueAt : current.dueAt,
		};
		validateAgendaItemDates(merged);

		const updated = await this.agendaItems.update({
			id: input.id,
			userId: input.userId,
			...(input.type !== undefined ? { type: input.type } : {}),
			...(input.status !== undefined ? { status: input.status } : {}),
			...(input.title !== undefined
				? { title: normalizeRequiredTitle(input.title) }
				: {}),
			...(input.description !== undefined
				? { description: normalizeOptionalText(input.description) }
				: {}),
			...(input.location !== undefined
				? { location: normalizeOptionalText(input.location) }
				: {}),
			...(input.recurrence !== undefined
				? { recurrence: input.recurrence }
				: {}),
			...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
			...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
			...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
		});

		if (!updated) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}

		return AgendaItemDto.fromEntity(updated);
	}
}

export { UpdateAgendaItemUseCase };
export type { UpdateAgendaItemUseCaseInput };
