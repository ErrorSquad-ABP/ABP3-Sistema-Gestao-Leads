import type {
	AgendaItem,
	AgendaItemStatus,
	AgendaItemType,
} from '../model/agenda.model';

type AgendaVisualTone = {
	badgeClassName: string;
	iconClassName: string;
	label: string;
};

const agendaTypeVisuals: Record<AgendaItemType, AgendaVisualTone> = {
	EVENT: {
		badgeClassName:
			'border-[color:var(--kpi-icon-brand)]/20 bg-[color:var(--kpi-surface-brand)] text-[color:var(--kpi-icon-brand)]',
		iconClassName:
			'bg-[color:var(--kpi-surface-brand)] text-[color:var(--kpi-icon-brand)]',
		label: 'Compromisso',
	},
	TASK: {
		badgeClassName:
			'border-[color:var(--kpi-icon-success)]/20 bg-[color:var(--kpi-surface-success)] text-[color:var(--kpi-icon-success)]',
		iconClassName:
			'bg-[color:var(--kpi-surface-success)] text-[color:var(--kpi-icon-success)]',
		label: 'Tarefa',
	},
};

function agendaTypeLabel(type: AgendaItemType) {
	return agendaTypeVisual(type).label;
}

function agendaStatusLabel(status: AgendaItemStatus) {
	switch (status) {
		case 'CANCELLED':
			return 'Cancelado';
		case 'DONE':
			return 'Concluído';
		case 'SCHEDULED':
			return 'Agendado';
	}
}

function agendaTypeVisual(type: AgendaItemType) {
	switch (type) {
		case 'EVENT':
			return agendaTypeVisuals.EVENT;
		case 'TASK':
			return agendaTypeVisuals.TASK;
	}
}

function agendaItemAriaLabel(item: AgendaItem) {
	return `${agendaTypeLabel(item.type)}: ${item.title}`;
}

export {
	agendaItemAriaLabel,
	agendaStatusLabel,
	agendaTypeLabel,
	agendaTypeVisual,
};
