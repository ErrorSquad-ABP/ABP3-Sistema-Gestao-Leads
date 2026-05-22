import type {
	Deal,
	DealImportance,
	DealPipelineSortMode,
	DealStage,
	DealStatus,
} from '@/features/deals/model/deals.model';

import { formatDealStatusLabel } from './deal-labels';

type PipelineStageKey = DealStage;

type PipelineStageDefinition = {
	key: PipelineStageKey;
	label: string;
};

const PIPELINE_STAGES: PipelineStageDefinition[] = [
	{ key: 'INITIAL_CONTACT', label: 'Contato inicial' },
	{ key: 'NEGOTIATION', label: 'Negociação' },
	{ key: 'PROPOSAL', label: 'Proposta' },
	{ key: 'CLOSING', label: 'Fechamento' },
];

function groupDealsByStage(deals: Deal[]) {
	const grouped: Record<PipelineStageKey, Deal[]> = {
		INITIAL_CONTACT: [],
		NEGOTIATION: [],
		PROPOSAL: [],
		CLOSING: [],
	};

	for (const deal of deals) {
		grouped[deal.stage].push(deal);
	}

	return grouped;
}

function parseApiDecimal(value: string | null) {
	if (!value) return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function formatDealValueBrl(value: string | null) {
	const parsed = parseApiDecimal(value);
	if (parsed === null) return '—';
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(parsed);
}

function sumDealsValueBrl(deals: Deal[]) {
	let sum = 0;
	let used = false;
	for (const deal of deals) {
		const parsed = parseApiDecimal(deal.value);
		if (parsed === null) continue;
		sum += parsed;
		used = true;
	}
	if (!used) return '—';
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(sum);
}

type ImportanceUi = {
	label: 'Quente' | 'Morna' | 'Fria';
};

function mapImportanceUi(importance: DealImportance): ImportanceUi {
	switch (importance) {
		case 'HOT':
			return { label: 'Quente' };
		case 'WARM':
			return { label: 'Morna' };
		case 'COLD':
			return { label: 'Fria' };
	}
}

type StatusUi = {
	label: string;
	badgeClassName: string;
};

function mapDealStatusUi(status: DealStatus): StatusUi {
	const label = formatDealStatusLabel(status);
	switch (status) {
		case 'OPEN':
			return {
				label,
				badgeClassName:
					'bg-emerald-50 text-emerald-700 border border-emerald-100/80',
			};
		case 'WON':
			return {
				label,
				badgeClassName: 'bg-teal-50 text-teal-700 border border-teal-100/80',
			};
		case 'LOST':
			return {
				label,
				badgeClassName: 'bg-rose-50 text-rose-700 border border-rose-100/80',
			};
	}
}

/**
 * Classes extras do botão de filtro (funil) com valor ativo —
 * alinhadas a `mapDealStatusUi` / badges em `DealDetailsDialog`.
 */
function getPipelineStatusFilterTriggerAccentClass(status: DealStatus | 'ALL') {
	if (status === 'ALL') {
		return '';
	}
	switch (status) {
		case 'OPEN':
			return 'border-emerald-200/90 bg-emerald-50 text-emerald-700 shadow-[0_1px_2px_rgba(16,185,129,0.08)] hover:bg-emerald-50/90';
		case 'WON':
			return 'border-teal-200/90 bg-teal-50 text-teal-700 shadow-[0_1px_2px_rgba(20,184,166,0.08)] hover:bg-teal-50/90';
		case 'LOST':
			return 'border-rose-200/90 bg-rose-50 text-rose-700 shadow-[0_1px_2px_rgba(244,63,94,0.08)] hover:bg-rose-50/90';
	}
}

/**
 * Idem para importância — espelha `getImportanceBadgeVisual` em `DealDetailsDialog`.
 */
function getPipelineImportanceFilterTriggerAccentClass(
	importance: DealImportance | 'ALL',
) {
	if (importance === 'ALL') {
		return '';
	}
	switch (importance) {
		case 'HOT':
			return 'border-[color:var(--brand-accent)]/35 bg-[color:var(--brand-accent-soft)]/30 text-[color:var(--brand-accent)] hover:bg-[color:var(--brand-accent-soft)]/40';
		case 'WARM':
			return 'border-amber-200/90 bg-amber-50 text-amber-700 hover:bg-amber-50/90';
		case 'COLD':
			return 'border-sky-200/90 bg-sky-50 text-sky-700 hover:bg-sky-50/90';
	}
}

/**
 * Ordenação por valor — verde ascendente / violeta descendente (etapa Proposta no funil).
 */
function getPipelineSortFilterTriggerAccentClass(mode: DealPipelineSortMode) {
	switch (mode) {
		case 'recent':
			return '';
		case 'value_asc':
			return 'border-emerald-200/90 bg-emerald-50 text-emerald-700 hover:bg-emerald-50/90';
		case 'value_desc':
			return 'border-violet-200/90 bg-violet-50 text-violet-700 hover:bg-violet-50/90';
	}
}

function initialsFromName(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((p) => p.at(0)?.toUpperCase() ?? '')
		.join('');
}

export {
	PIPELINE_STAGES,
	formatDealValueBrl,
	getPipelineImportanceFilterTriggerAccentClass,
	getPipelineSortFilterTriggerAccentClass,
	getPipelineStatusFilterTriggerAccentClass,
	groupDealsByStage,
	initialsFromName,
	mapDealStatusUi,
	mapImportanceUi,
	sumDealsValueBrl,
};
export type { PipelineStageDefinition, PipelineStageKey };
