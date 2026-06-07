import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AgendaItemDto } from '../dto/agenda-item.dto.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';

@Injectable()
class CancelAgendaItemUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
	) {}

	async execute(id: string, userId: string): Promise<AgendaItemDto> {
		const updated = await this.agendaItems.cancelForUser(id, userId);
		if (!updated) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}
		return AgendaItemDto.fromEntity(updated);
	}
}

export { CancelAgendaItemUseCase };
