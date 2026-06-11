import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { AgendaItemDto } from '../dto/agenda-item.dto.js';
import { AgendaAccessPolicy } from '../services/agenda-access-policy.service.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';

@Injectable()
class CompleteAgendaItemUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
		@Inject(AgendaAccessPolicy)
		private readonly agendaAccessPolicy: AgendaAccessPolicy,
	) {}

	async execute(id: string, actor: LeadActor): Promise<AgendaItemDto> {
		const current = await this.agendaItems.findById(id);
		if (!current) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}
		this.agendaAccessPolicy.assertCanManageItem(actor, current.userId);
		if (current.type !== 'TASK') {
			throw new BadRequestException('Apenas tarefas podem ser concluídas.');
		}

		const updated = await this.agendaItems.completeTaskForUser(
			id,
			current.userId,
		);
		if (!updated) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}
		return AgendaItemDto.fromEntity(updated, {
			includeOwner: this.agendaAccessPolicy.shouldIncludeOwner(actor),
		});
	}
}

export { CompleteAgendaItemUseCase };
