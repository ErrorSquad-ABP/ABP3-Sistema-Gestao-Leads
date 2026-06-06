import { Inject, Injectable } from '@nestjs/common';

import type { AgendaMetricsDto } from '../dto/agenda-item.dto.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';

@Injectable()
class GetAgendaMetricsUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
	) {}

	async execute(userId: string, now = new Date()): Promise<AgendaMetricsDto> {
		return this.agendaItems.getMetrics({ userId, now });
	}
}

export { GetAgendaMetricsUseCase };
