import { Inject, Injectable } from '@nestjs/common';

import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import type { AgendaMetricsDto } from '../dto/agenda-item.dto.js';
import { AgendaAccessPolicy } from '../services/agenda-access-policy.service.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';

@Injectable()
class GetAgendaMetricsUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
		@Inject(AgendaAccessPolicy)
		private readonly agendaAccessPolicy: AgendaAccessPolicy,
	) {}

	async execute(actor: LeadActor, now = new Date()): Promise<AgendaMetricsDto> {
		const userId = this.agendaAccessPolicy.resolveMetricsUserId(actor);
		return this.agendaItems.getMetrics({ userId, now });
	}
}

export { GetAgendaMetricsUseCase };
