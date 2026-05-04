import type {
	Deal,
	DealImportance,
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
	groupDealsByStage,
	initialsFromName,
	mapDealStatusUi,
	mapImportanceUi,
	sumDealsValueBrl,
};
export type { PipelineStageDefinition, PipelineStageKey };
