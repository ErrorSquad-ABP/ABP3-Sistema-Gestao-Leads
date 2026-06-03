import { BadRequestException } from '@nestjs/common';

import type {
	AgendaItemType,
	AgendaRecurrence,
} from '../../domain/agenda-item.types.js';

type AgendaItemDateInput = {
	dueAt?: Date | null;
	endsAt?: Date | null;
	startsAt?: Date | null;
	type: AgendaItemType;
};

function normalizeOptionalText(
	value: string | null | undefined,
): string | null {
	const normalized = value?.trim();
	return normalized ? normalized : null;
}

function normalizeRequiredTitle(value: string): string {
	const normalized = value.trim();
	if (!normalized) {
		throw new BadRequestException('Título da agenda é obrigatório.');
	}
	return normalized;
}

function normalizeRecurrence(
	value: AgendaRecurrence | undefined,
): AgendaRecurrence {
	return value ?? 'NONE';
}

function validateAgendaItemDates(input: AgendaItemDateInput): void {
	if (input.type === 'EVENT' && !input.startsAt) {
		throw new BadRequestException(
			'Compromissos precisam de data e hora de início.',
		);
	}

	if (input.endsAt && !input.startsAt) {
		throw new BadRequestException('Data de fim exige uma data de início.');
	}

	if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) {
		throw new BadRequestException('Data de fim deve ser posterior ao início.');
	}
}

export {
	normalizeOptionalText,
	normalizeRecurrence,
	normalizeRequiredTitle,
	validateAgendaItemDates,
};
