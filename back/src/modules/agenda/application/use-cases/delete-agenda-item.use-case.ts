import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';

@Injectable()
class DeleteAgendaItemUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
	) {}

	async execute(id: string, userId: string): Promise<void> {
		const deleted = await this.agendaItems.deleteForUser(id, userId);
		if (!deleted) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}
	}
}

export { DeleteAgendaItemUseCase };
