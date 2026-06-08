import type { ReactNode } from 'react';
import {
	CheckCircle2,
	Clock3,
	Target,
	XCircle,
} from 'lucide-react';
import {
	Line,
	LineChart,
	ResponsiveContainer,
} from 'recharts';

import type { KpiCardDelta, KpiCardVariant } from '@/components/metrics/KpiCard';
import { CHART_COLORS } from '@/lib/charts/chart-colors';

import type { AnalyticDashboard } from '../model/analytic-dashboard.model';

type TrendPoint = {
	readonly label: string;
	readonly totalLeads: number;
	readonly convertedLeads: number;
	readonly lostLeads: number;
	readonly conversionRate: number;
	readonly averageTimeToFirstInteractionHours: number | null;
};

type AnalyticKpiCardConfig = {
	readonly key: string;
	readonly title: string;
	readonly value: string;
	readonly variant: KpiCardVariant;
	readonly icon: ReactNode;
	readonly delta: KpiCardDelta;
	readonly sparkline: ReactNode;
	readonly sparklineLabel: string;
};

function formatCount(value: number) {
	return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercent(value: number) {
	return `${new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: 1,
		minimumFractionDigits: 0,
	}).format(value)}%`;
}

function formatHours(value: number | null) {
	if (value == null) {
		return 'Sem dados';
	}

	if (value < 1) {
		return `${Math.round(value * 60)}min`;
	}

	const hours = Math.floor(value);
	const minutes = Math.round((value - hours) * 60);
	return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatDeltaPercent(value: number | null) {
	if (value == null) {
		return '0%';
	}

	return `${value > 0 ? '+' : ''}${formatPercent(value)}`;
}

function formatDeltaPoints(value: number | undefined) {
	const delta = value ?? 0;
	return `${delta > 0 ? '+' : ''}${new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: 1,
		minimumFractionDigits: 1,
	}).format(delta)} p.p.`;
}

function deltaTone(
	delta: number,
	positiveWhenUp: boolean,
): KpiCardDelta['tone'] {
	if (delta === 0) return 'neutral';
	if (positiveWhenUp) {
		return delta > 0 ? 'positive' : 'negative';
	}
	return delta > 0 ? 'negative' : 'positive';
}

function buildSparkline(
	points: readonly { label: string; value: number }[],
	color: string,
	label: string,
) {
	return (
		<ResponsiveContainer height={36} width={80}>
			<LineChart data={points}>
				<Line
					dataKey="value"
					dot={{ fill: color, r: 2, strokeWidth: 0 }}
					stroke={color}
					strokeWidth={2}
					type="monotone"
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}

function buildAnalyticKpiCards(
	dashboard: AnalyticDashboard,
	trendData: readonly TrendPoint[],
): AnalyticKpiCardConfig[] {
	return [
		{
			key: 'conversion-rate',
			title: 'Taxa de conversão',
			value: formatPercent(dashboard.kpis.conversionRate.value),
			variant: 'brand',
			icon: <Target className="size-5" />,
			delta: {
				value: formatDeltaPoints(dashboard.kpis.conversionRate.deltaPoints),
				tone: deltaTone(dashboard.kpis.conversionRate.delta, true),
				label: 'vs. período anterior',
			},
			sparkline: buildSparkline(
				trendData.map((point) => ({
					label: point.label,
					value: point.conversionRate,
				})),
				CHART_COLORS.barDefault,
				'Variação da taxa de conversão no período',
			),
			sparklineLabel: 'Variação da taxa de conversão no período',
		},
		{
			key: 'converted-leads',
			title: 'Leads convertidos',
			value: formatCount(dashboard.kpis.convertedLeads.value),
			variant: 'success',
			icon: <CheckCircle2 className="size-5" />,
			delta: {
				value: formatDeltaPercent(dashboard.kpis.convertedLeads.deltaPercentage),
				tone: deltaTone(dashboard.kpis.convertedLeads.delta, true),
				label: 'vs. período anterior',
			},
			sparkline: buildSparkline(
				trendData.map((point) => ({
					label: point.label,
					value: point.convertedLeads,
				})),
				CHART_COLORS.performanceOk,
				'Variação de leads convertidos no período',
			),
			sparklineLabel: 'Variação de leads convertidos no período',
		},
		{
			key: 'lost-leads',
			title: 'Leads perdidos',
			value: formatCount(dashboard.kpis.lostLeads.value),
			variant: 'danger-soft',
			icon: <XCircle className="size-5" />,
			delta: {
				value: formatDeltaPercent(dashboard.kpis.lostLeads.deltaPercentage),
				tone: deltaTone(dashboard.kpis.lostLeads.delta, false),
				label: 'vs. período anterior',
			},
			sparkline: buildSparkline(
				trendData.map((point) => ({
					label: point.label,
					value: point.lostLeads,
				})),
				CHART_COLORS.performanceBelow,
				'Variação de leads perdidos no período',
			),
			sparklineLabel: 'Variação de leads perdidos no período',
		},
		{
			key: 'average-time',
			title: 'Tempo médio até atendimento',
			value: formatHours(dashboard.kpis.averageTimeToFirstInteraction.value),
			variant: 'neutral',
			icon: <Clock3 className="size-5" />,
			delta: {
				value: formatDeltaPercent(
					dashboard.kpis.averageTimeToFirstInteraction.deltaPercentage,
				),
				tone: deltaTone(
					dashboard.kpis.averageTimeToFirstInteraction.delta,
					false,
				),
				label: 'vs. período anterior',
			},
			sparkline: buildSparkline(
				trendData.map((point) => ({
					label: point.label,
					value: point.averageTimeToFirstInteractionHours ?? 0,
				})),
				CHART_COLORS.neutral,
				'Variação do tempo médio até atendimento no período',
			),
			sparklineLabel: 'Variação do tempo médio até atendimento no período',
		},
	];
}

function importanceChartColor(key: string): string {
	switch (key) {
		case 'COLD':
			return CHART_COLORS.cold;
		case 'WARM':
			return CHART_COLORS.warm;
		case 'HOT':
			return CHART_COLORS.hot;
		default:
			return CHART_COLORS.neutral;
	}
}

export { buildAnalyticKpiCards, importanceChartColor };
