import type { LucideIcon } from 'lucide-react';
import {
	CircleDollarSign,
	Flame,
	Target,
	TrendingUp,
	Trophy,
} from 'lucide-react';

import type { KpiCardVariant } from '@/components/metrics/KpiCard';
import type { DealsMetrics } from '@/features/deals/model/deals.model';

type NegotiationsMetric = {
	readonly description?: string;
	readonly icon: LucideIcon;
	readonly key:
		| 'averageTicket'
		| 'conversionRate'
		| 'openDeals'
		| 'pipelineValue'
		| 'wonDeals';
	readonly label: string;
	readonly value: string;
	readonly variant: KpiCardVariant;
};

function formatBrl(value: number) {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(value);
}

function formatPercent(value: number) {
	return new Intl.NumberFormat('pt-BR', {
		style: 'percent',
		maximumFractionDigits: 0,
	}).format(value);
}

function getNegotiationsTopMetrics(
	metrics: DealsMetrics | null,
): NegotiationsMetric[] {
	return [
		{
			key: 'pipelineValue',
			label: 'Valor total do funil',
			value: metrics ? formatBrl(metrics.totalPipelineValue) : '--',
			description: 'Negociações abertas',
			icon: CircleDollarSign,
			variant: 'brand',
		},
		{
			key: 'openDeals',
			label: 'Negociações abertas',
			value: metrics ? String(metrics.openDealsCount) : '--',
			description: 'Dentro do seu escopo',
			icon: TrendingUp,
			variant: 'neutral',
		},
		{
			key: 'conversionRate',
			label: 'Taxa de conversão',
			value: metrics ? formatPercent(metrics.conversionRate) : '--',
			description: 'Ganhas sobre encerradas',
			icon: Flame,
			variant: metrics && metrics.conversionRate > 0 ? 'success' : 'warning',
		},
		{
			key: 'wonDeals',
			label: 'Negociações ganhas',
			value: metrics ? String(metrics.wonDealsCount) : '--',
			description: metrics
				? `${metrics.lostDealsCount} perdidas`
				: 'Encerradas no escopo',
			icon: Trophy,
			variant: 'success',
		},
		{
			key: 'averageTicket',
			label: 'Ticket médio',
			value: metrics ? formatBrl(metrics.averageTicket) : '--',
			description: 'Negociações ganhas',
			icon: Target,
			variant: 'neutral',
		},
	];
}

export { getNegotiationsTopMetrics };
export type { NegotiationsMetric };
