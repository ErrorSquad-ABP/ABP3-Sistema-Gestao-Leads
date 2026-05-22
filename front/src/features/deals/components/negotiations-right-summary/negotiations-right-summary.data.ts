import {
	PIPELINE_STAGES,
	groupDealsByStage,
} from '@/features/deals/lib/pipeline';
import type { Deal, DealStage } from '@/features/deals/model/deals.model';

type ActivityIcon = 'calendar' | 'phone' | 'message';

type PipelineSummarySegment = {
	stage: DealStage;
	label: string;
	amountLabel: string;
	percentage: number;
	color: string;
};

type PipelineSummaryData = {
	segments: PipelineSummarySegment[];
	totalValue: number;
	centerValueLabel: string;
	centerSubLabel: string;
};

type ImportanceKind = 'HOT' | 'WARM' | 'COLD';

type ImportanceSummaryItem = {
	kind: ImportanceKind;
	label: string;
	amountLabel: string;
	percentage: number;
};

type ImportanceSummaryData = {
	items: ImportanceSummaryItem[];
};

type ImportantActivity = {
	id: string;
	title: string;
	time: string;
	tag: string;
	icon: ActivityIcon;
};

function parseValue(value: string | null) {
	if (!value) return 0;
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

function sumDealsValue(deals: Deal[]) {
	let t = 0;
	for (const d of deals) t += parseValue(d.value);
	return t;
}

function formatFunnelCenterValueBrl(total: number): string {
	if (total <= 0) return 'R$ 0';
	if (total >= 1_000_000) {
		const m = total / 1_000_000;
		return `R$ ${m.toFixed(2).replace('.', ',')}M`;
	}
	if (total >= 1_000) {
		return `R$ ${(total / 1_000).toFixed(1).replace('.', ',')}k`;
	}
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(total);
}

function formatStageValueBrl(total: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(total);
}

const STAGE_DONUT_COLORS: Record<DealStage, string> = {
	INITIAL_CONTACT: 'var(--brand-accent)',
	NEGOTIATION: 'var(--brand-accent-soft)',
	PROPOSAL: 'var(--muted)',
	CLOSING: 'var(--primary)',
};

function buildPipelineSummaryFromDeals(deals: Deal[]): PipelineSummaryData {
	const totalValue = sumDealsValue(deals);
	const grouped = groupDealsByStage(deals);
	const counts = PIPELINE_STAGES.map((def) => sumDealsValue(grouped[def.key]));
	const p: number[] =
		totalValue > 0
			? counts.map((c) => Math.round((c / totalValue) * 100))
			: PIPELINE_STAGES.map(() => 0);
	if (totalValue > 0 && p.length === 4) {
		const diff = 100 - p.reduce((a, b) => a + b, 0);
		const m = p.indexOf(Math.max(...p));
		if (m === 0) p[0] = (p[0] ?? 0) + diff;
		else if (m === 1) p[1] = (p[1] ?? 0) + diff;
		else if (m === 2) p[2] = (p[2] ?? 0) + diff;
		else if (m === 3) p[3] = (p[3] ?? 0) + diff;
	}

	const p0 = p[0] ?? 0;
	const p1 = p[1] ?? 0;
	const p2 = p[2] ?? 0;
	const p3 = p[3] ?? 0;
	const [s0, s1, s2, s3] = PIPELINE_STAGES;
	const segments: PipelineSummarySegment[] = [
		{
			stage: s0.key,
			label: s0.label,
			amountLabel: formatStageValueBrl(counts[0] ?? 0),
			percentage: p0,
			color: STAGE_DONUT_COLORS[s0.key],
		},
		{
			stage: s1.key,
			label: s1.label,
			amountLabel: formatStageValueBrl(counts[1] ?? 0),
			percentage: p1,
			color: STAGE_DONUT_COLORS[s1.key],
		},
		{
			stage: s2.key,
			label: s2.label,
			amountLabel: formatStageValueBrl(counts[2] ?? 0),
			percentage: p2,
			color: STAGE_DONUT_COLORS[s2.key],
		},
		{
			stage: s3.key,
			label: s3.label,
			amountLabel: formatStageValueBrl(counts[3] ?? 0),
			percentage: p3,
			color: STAGE_DONUT_COLORS[s3.key],
		},
	];

	return {
		segments,
		totalValue,
		centerValueLabel: formatFunnelCenterValueBrl(totalValue),
		centerSubLabel: 'Total',
	};
}

const IMPORTANCE_LABEL: Record<ImportanceKind, string> = {
	HOT: 'Quentes',
	WARM: 'Mornas',
	COLD: 'Frias',
};

function buildImportanceFromDeals(deals: Deal[]): ImportanceSummaryData {
	const by: Record<ImportanceKind, Deal[]> = { HOT: [], WARM: [], COLD: [] };
	for (const d of deals) {
		if (
			d.importance === 'HOT' ||
			d.importance === 'WARM' ||
			d.importance === 'COLD'
		) {
			by[d.importance].push(d);
		}
	}
	const hotVal = sumDealsValue(by.HOT);
	const warmVal = sumDealsValue(by.WARM);
	const coldVal = sumDealsValue(by.COLD);
	const t = hotVal + warmVal + coldVal;
	const p: number[] =
		t > 0
			? [
					Math.round((hotVal / t) * 100),
					Math.round((warmVal / t) * 100),
					Math.round((coldVal / t) * 100),
				]
			: [0, 0, 0];
	if (t > 0 && p.length === 3) {
		const diff = 100 - p.reduce((a, b) => a + b, 0);
		const m = p.indexOf(Math.max(...p));
		if (m === 0) p[0] = (p[0] ?? 0) + diff;
		else if (m === 1) p[1] = (p[1] ?? 0) + diff;
		else if (m === 2) p[2] = (p[2] ?? 0) + diff;
	}

	const brl = (n: number) =>
		new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
			maximumFractionDigits: 0,
		}).format(n);

	const items: ImportanceSummaryItem[] = [
		{
			kind: 'HOT',
			label: IMPORTANCE_LABEL.HOT,
			amountLabel: brl(hotVal),
			percentage: p[0] ?? 0,
		},
		{
			kind: 'WARM',
			label: IMPORTANCE_LABEL.WARM,
			amountLabel: brl(warmVal),
			percentage: p[1] ?? 0,
		},
		{
			kind: 'COLD',
			label: IMPORTANCE_LABEL.COLD,
			amountLabel: brl(coldVal),
			percentage: p[2] ?? 0,
		},
	];

	return { items };
}

const IMPORTANT_ACTIVITIES_MOCK: ImportantActivity[] = [
	{
		id: '1',
		title: 'Reunião com Cliente Exemplo ALB',
		time: 'Hoje às 15:00',
		tag: 'Negociação',
		icon: 'calendar',
	},
	{
		id: '2',
		title: 'Ligação com Marcos Ribeiro',
		time: 'Amanhã às 10:30',
		tag: 'Proposta',
		icon: 'phone',
	},
	{
		id: '3',
		title: 'Enviar proposta comercial',
		time: 'Qui, 23/05 às 14:00',
		tag: 'Fechamento',
		icon: 'message',
	},
];

export {
	buildImportanceFromDeals,
	buildPipelineSummaryFromDeals,
	IMPORTANT_ACTIVITIES_MOCK,
	IMPORTANCE_LABEL,
};
export type {
	ActivityIcon,
	ImportantActivity,
	ImportanceKind,
	ImportanceSummaryData,
	ImportanceSummaryItem,
	PipelineSummaryData,
	PipelineSummarySegment,
};
