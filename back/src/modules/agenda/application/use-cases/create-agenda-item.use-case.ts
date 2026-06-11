import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AgendaItemDto } from '../dto/agenda-item.dto.js';
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import {
	normalizeOptionalText,
	normalizeRecurrence,
	normalizeRequiredTitle,
	validateAgendaItemDates,
} from './agenda-item-validation.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type {
	AgendaItemRepository,
	AgendaItemType,
	AgendaRecurrence,
} from '../../domain/agenda-item.types.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';

type CreateAgendaItemUseCaseInput = {
	description?: string | null;
	dueAt?: Date | null;
	endsAt?: Date | null;
	leadId?: string | null;
	location?: string | null;
	recurrence?: AgendaRecurrence;
	startsAt?: Date | null;
	title: string;
	type: AgendaItemType;
	userId: string;
	userRole?: UserRole;
};

@Injectable()
class CreateAgendaItemUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
		@Inject(LeadAccessPolicy)
		private readonly leadAccessPolicy?: LeadAccessPolicy,
	) {}

	async execute(input: CreateAgendaItemUseCaseInput): Promise<AgendaItemDto> {
		validateAgendaItemDates(input);
		await this.assertCanUseLead(input.leadId, input.userId, input.userRole);

		const item = await this.agendaItems.create({
			userId: input.userId,
			leadId: input.leadId ?? null,
			type: input.type,
			title: normalizeRequiredTitle(input.title),
			description: normalizeOptionalText(input.description),
			location: normalizeOptionalText(input.location),
			recurrence: normalizeRecurrence(input.recurrence),
			startsAt: input.startsAt ?? null,
			endsAt: input.endsAt ?? null,
			dueAt: input.dueAt ?? null,
		});

		return AgendaItemDto.fromEntity(item);
	}

	private async assertCanUseLead(
		leadId: string | null | undefined,
		userId: string,
		userRole: UserRole | undefined,
	): Promise<void> {
		if (!leadId) {
			return;
		}
		if (!userRole || !this.leadAccessPolicy) {
			throw new NotFoundException('Lead não encontrado.');
		}
		const snapshot = await this.agendaItems.findLeadAccessSnapshot(leadId);
		if (!snapshot) {
			throw new NotFoundException('Lead não encontrado.');
		}
		await this.leadAccessPolicy.assertCanReadLeadSnapshot(
			{ userId, role: userRole } satisfies LeadActor,
			snapshot,
		);
	}
}

export { CreateAgendaItemUseCase };
export type { CreateAgendaItemUseCaseInput };
