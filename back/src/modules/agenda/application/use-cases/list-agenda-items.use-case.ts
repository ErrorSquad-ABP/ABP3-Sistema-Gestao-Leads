import { Inject, Injectable } from '@nestjs/common';

import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import {
	AgendaItemDto,
	type AgendaItemsResponseDto,
} from '../dto/agenda-item.dto.js';
import { AgendaAccessPolicy } from '../services/agenda-access-policy.service.js';
import type { AgendaItemRepository } from '../../domain/agenda-item.types.js';

const AGENDA_ITEM_REPOSITORY = Symbol('AgendaItemRepository');
const DEFAULT_AGENDA_ITEMS_LIMIT = 50;

type ListAgendaItemsInput = {
	actor: LeadActor;
	from?: Date;
	leadId?: string;
	limit?: number;
	ownerUserId?: string;
	search?: string;
	status?: 'SCHEDULED' | 'DONE' | 'CANCELLED';
	to?: Date;
	type?: 'TASK' | 'EVENT';
};

@Injectable()
class ListAgendaItemsUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
		@Inject(AgendaAccessPolicy)
		private readonly agendaAccessPolicy: AgendaAccessPolicy,
	) {}

	async execute(input: ListAgendaItemsInput): Promise<AgendaItemsResponseDto> {
		const userId = this.agendaAccessPolicy.resolveListUserId(
			input.actor,
			input.ownerUserId,
		);
		const includeOwner = this.agendaAccessPolicy.shouldIncludeOwner(
			input.actor,
		);
		const items = await this.agendaItems.list({
			from: input.from,
			leadId: input.leadId,
			limit: input.limit ?? DEFAULT_AGENDA_ITEMS_LIMIT,
			search: input.search,
			status: input.status,
			to: input.to,
			type: input.type,
			userId,
		});
		return {
			items: items.map((item) =>
				AgendaItemDto.fromEntity(item, { includeOwner }),
			),
		};
	}
}

export { AGENDA_ITEM_REPOSITORY, ListAgendaItemsUseCase };
export type { ListAgendaItemsInput };
