import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';
import { AgendaAccessPolicy } from '../services/agenda-access-policy.service.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';

@Injectable()
class DeleteAgendaItemUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
		@Inject(AgendaAccessPolicy)
		private readonly agendaAccessPolicy: AgendaAccessPolicy,
	) {}

	async execute(id: string, actor: LeadActor): Promise<void> {
		const current = await this.agendaItems.findById(id);
		if (!current) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}
		this.agendaAccessPolicy.assertCanManageItem(actor, current.userId);

		const deleted = await this.agendaItems.deleteForUser(id, current.userId);
		if (!deleted) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}
	}
}

export { DeleteAgendaItemUseCase };
