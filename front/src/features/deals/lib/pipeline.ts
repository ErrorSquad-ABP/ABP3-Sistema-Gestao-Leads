import type { Deal, DealImportance, DealStage } from '@/features/deals/model/deals.model';

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
	mapImportanceUi,
	sumDealsValueBrl,
};
export type { PipelineStageDefinition, PipelineStageKey };
