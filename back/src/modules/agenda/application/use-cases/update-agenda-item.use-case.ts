import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AgendaItemDto } from '../dto/agenda-item.dto.js';
import { LeadAccessPolicy } from '../../../leads/application/services/lead-access-policy.service.js';
import type { LeadActor } from '../../../leads/application/types/lead-actor.js';
import { AgendaAccessPolicy } from '../services/agenda-access-policy.service.js';
import {
	normalizeOptionalText,
	normalizeRequiredTitle,
	validateAgendaItemDates,
} from './agenda-item-validation.js';
import { AGENDA_ITEM_REPOSITORY } from './list-agenda-items.use-case.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import type {
	AgendaItemRepository,
	AgendaItemStatus,
	AgendaItemType,
	AgendaRecurrence,
} from '../../domain/agenda-item.types.js';

type UpdateAgendaItemUseCaseInput = {
	actor: LeadActor;
	description?: string | null;
	dueAt?: Date | null;
	endsAt?: Date | null;
	id: string;
	leadId?: string | null;
	location?: string | null;
	recurrence?: AgendaRecurrence;
	startsAt?: Date | null;
	status?: AgendaItemStatus;
	title?: string;
	type?: AgendaItemType;
};

@Injectable()
class UpdateAgendaItemUseCase {
	constructor(
		@Inject(AGENDA_ITEM_REPOSITORY)
		private readonly agendaItems: AgendaItemRepository,
		@Inject(LeadAccessPolicy)
		private readonly leadAccessPolicy?: LeadAccessPolicy,
		@Inject(AgendaAccessPolicy)
		private readonly agendaAccessPolicy?: AgendaAccessPolicy,
	) {}

	async execute(input: UpdateAgendaItemUseCaseInput): Promise<AgendaItemDto> {
		const current = await this.agendaItems.findById(input.id);
		if (!current) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}
		this.agendaAccessPolicy?.assertCanManageItem(input.actor, current.userId);

		const merged = {
			type: input.type ?? current.type,
			startsAt:
				input.startsAt !== undefined ? input.startsAt : current.startsAt,
			endsAt: input.endsAt !== undefined ? input.endsAt : current.endsAt,
			dueAt: input.dueAt !== undefined ? input.dueAt : current.dueAt,
		};
		validateAgendaItemDates(merged);
		if (input.leadId !== undefined) {
			await this.assertCanUseLead(
				input.leadId,
				input.actor.userId,
				input.actor.role,
			);
		}

		const updated = await this.agendaItems.update({
			id: input.id,
			userId: current.userId,
			...(input.leadId !== undefined ? { leadId: input.leadId } : {}),
			...(input.type !== undefined ? { type: input.type } : {}),
			...(input.status !== undefined ? { status: input.status } : {}),
			...(input.title !== undefined
				? { title: normalizeRequiredTitle(input.title) }
				: {}),
			...(input.description !== undefined
				? { description: normalizeOptionalText(input.description) }
				: {}),
			...(input.location !== undefined
				? { location: normalizeOptionalText(input.location) }
				: {}),
			...(input.recurrence !== undefined
				? { recurrence: input.recurrence }
				: {}),
			...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
			...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
			...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
		});

		if (!updated) {
			throw new NotFoundException('Item da agenda não encontrado.');
		}

		return AgendaItemDto.fromEntity(updated, {
			includeOwner: this.agendaAccessPolicy?.shouldIncludeOwner(input.actor),
		});
	}

	private async assertCanUseLead(
		leadId: string | null,
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

export { UpdateAgendaItemUseCase };
export type { UpdateAgendaItemUseCaseInput };
