import type { LucideIcon } from 'lucide-react';
import {
	CircleDollarSign,
	Flame,
	TrendingUp,
	Trophy,
} from 'lucide-react';

import type { Deal } from '@/features/deals/model/deals.model';

type MetricTone = 'brand' | 'neutral';

type NegotiationsMetric = {
	key: 'pipelineValue' | 'openDeals' | 'conversionRate' | 'wonDeals';
	label: string;
	value: string;
	change: string;
	icon: LucideIcon;
	tone?: MetricTone;
};

function formatBrl(value: number) {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(value);
}

function parseApiDecimal(value: string) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function computePipelineValue(deals: Deal[]) {
	let sum = 0;
	let used = false;
	for (const deal of deals) {
		if (!deal.value) continue;
		const parsed = parseApiDecimal(deal.value);
		if (parsed === null) continue;
		sum += parsed;
		used = true;
	}
	return used ? formatBrl(sum) : null;
}

function computeOpenDeals(deals: Deal[]) {
	return deals.filter((d) => d.status === 'OPEN').length;
}

function computeWonDeals(deals: Deal[]) {
	return deals.filter((d) => d.status === 'WON').length;
}

function computeConversionRate(deals: Deal[]) {
	const closed = deals.filter((d) => d.status === 'WON' || d.status === 'LOST');
	if (closed.length === 0) return null;
	const won = closed.filter((d) => d.status === 'WON').length;
	return `${Math.round((won / closed.length) * 100)}%`;
}

/**
 * Métricas do topo da tela. Quando não há dados suficientes no payload atual,
 * retorna os valores de fallback do design para manter a UI estável.
 */
function getNegotiationsTopMetrics(deals: Deal[]): NegotiationsMetric[] {
	const pipelineValue = computePipelineValue(deals) ?? 'R$ 1.280.450';
	const openDeals = computeOpenDeals(deals) || 32;
	const conversionRate = computeConversionRate(deals) ?? '28%';
	const wonDeals = computeWonDeals(deals) || 12;

	return [
		{
			key: 'pipelineValue',
			label: 'Valor total do funil',
			value: pipelineValue,
			change: '↑ 18% vs último mês',
			icon: CircleDollarSign,
			tone: 'brand',
		},
		{
			key: 'openDeals',
			label: 'Negociações abertas',
			value: String(openDeals),
			change: '↑ 7 novas esta semana',
			icon: TrendingUp,
			tone: 'neutral',
		},
		{
			key: 'conversionRate',
			label: 'Taxa de conversão',
			value: conversionRate,
			change: '↑ 6pp vs último mês',
			icon: Flame,
			tone: 'neutral',
		},
		{
			key: 'wonDeals',
			label: 'Negociações ganha(s)',
			value: String(wonDeals),
			change: '↑ 3 fechadas este mês',
			icon: Trophy,
			tone: 'neutral',
		},
	];
}

export { getNegotiationsTopMetrics };
export type { NegotiationsMetric };
