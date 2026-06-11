import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
	AgendaItemDto,
	type AgendaItemsResponseDto,
} from '../dto/agenda-item.dto.js';
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';

const LEAD_AGENDA_ITEMS_LIMIT = 5;

type ListLeadAgendaItemsInput = {
	actor: LeadActor;
	leadId: string;
	userId: string;
};

@Injectable()
class ListLeadAgendaItemsUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
		@Inject(LeadAccessPolicy)
		private readonly leadAccessPolicy: LeadAccessPolicy,
	) {}

	async execute(
		input: ListLeadAgendaItemsInput,
	): Promise<AgendaItemsResponseDto> {
		const snapshot = await this.agendaItems.findLeadAccessSnapshot(
			input.leadId,
		);
		if (!snapshot) {
			throw new NotFoundException('Lead não encontrado.');
		}
		await this.leadAccessPolicy.assertCanReadLeadSnapshot(
			input.actor,
			snapshot,
		);

		const items = await this.agendaItems.list({
			leadId: input.leadId,
			limit: LEAD_AGENDA_ITEMS_LIMIT,
			status: 'SCHEDULED',
			userId: input.userId,
		});
		return { items: items.map((item) => AgendaItemDto.fromEntity(item)) };
	}
}

export { ListLeadAgendaItemsUseCase };
export type { ListLeadAgendaItemsInput };
