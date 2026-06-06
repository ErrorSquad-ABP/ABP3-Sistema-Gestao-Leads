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

const agendaStatusLabels: Record<AgendaItemStatus, string> = {
	CANCELLED: 'Cancelado',
	DONE: 'Concluído',
	SCHEDULED: 'Agendado',
};

function agendaTypeLabel(type: AgendaItemType) {
	return agendaTypeVisuals[type].label;
}

function agendaStatusLabel(status: AgendaItemStatus) {
	return agendaStatusLabels[status];
}

function agendaTypeVisual(type: AgendaItemType) {
	return agendaTypeVisuals[type];
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
