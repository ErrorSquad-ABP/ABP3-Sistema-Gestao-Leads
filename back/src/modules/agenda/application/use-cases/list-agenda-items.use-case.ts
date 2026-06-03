import { Inject, Injectable } from '@nestjs/common';

import {
	AgendaItemDto,
	type AgendaItemsResponseDto,
} from '../dto/agenda-item.dto.js';
import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';

const AGENDA_ITEM_REPOSITORY = Symbol('AgendaItemRepository');
const DEFAULT_AGENDA_ITEMS_LIMIT = 50;

type ListAgendaItemsInput = {
	from?: Date;
	limit?: number;
	status?: 'SCHEDULED' | 'DONE' | 'CANCELLED';
	to?: Date;
	type?: 'TASK' | 'EVENT';
	userId: string;
};

@Injectable()
class ListAgendaItemsUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
	) {}

	async execute(input: ListAgendaItemsInput): Promise<AgendaItemsResponseDto> {
		const items = await this.agendaItems.list({
			...input,
			limit: input.limit ?? DEFAULT_AGENDA_ITEMS_LIMIT,
		});
		return { items: items.map(AgendaItemDto.fromEntity) };
	}
}

export { AGENDA_ITEM_REPOSITORY, ListAgendaItemsUseCase };
export type { ListAgendaItemsInput };
