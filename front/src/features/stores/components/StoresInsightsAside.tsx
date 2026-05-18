'use client';

import { useState } from 'react';
import { BadgeDollarSign, CheckCircle2, Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { brazilMapStates, brazilMapViewBox } from '../lib/brazil-map';
import type { StoreTableRow } from '../lib/store-catalog-view';

type DistributionItem = {
	count: number;
	label: string;
};

type StoresDistributionCardProps = {
	distribution: DistributionItem[];
	storesCount: number;
};

type StoresOperationalHighlightsCardProps = {
	averageLeads: number;
	topConvertedStore: StoreTableRow | null;
	topRevenueStore: StoreTableRow | null;
	topStore: StoreTableRow | null;
	totalConvertedLeads: number;
	totalLeadCount: number;
	totalWonValue: number;
};

type StoresCoverageCardProps = {
	coverageDistribution: DistributionItem[];
	storesCount: number;
	uniqueStatesCount: number;
};

type StoresInsightsAsideProps = StoresOperationalHighlightsCardProps &
	StoresCoverageCardProps;

const MAX_VISIBLE_DISTRIBUTION_ITEMS = 8;

function getStateFill(count: number, maxCount: number) {
	if (count <= 0 || maxCount <= 0) {
		return '#f8fafc';
	}

	const opacity = 0.22 + (count / maxCount) * 0.58;
	return `rgba(244, 81, 30, ${opacity.toFixed(2)})`;
}

function getLeadStateLabel(count: number) {
	if (count === 1) {
		return '1 lead';
	}
	return `${count} leads`;
}

function formatCount(value: number) {
	const roundedValue = Math.round(value);
	const sign = roundedValue < 0 ? '-' : '';
	const digits = Math.abs(roundedValue).toString();
	const groups: string[] = [];

	for (let index = digits.length; index > 0; index -= 3) {
		groups.unshift(digits.slice(Math.max(0, index - 3), index));
	}

	return `${sign}${groups.join('.')}`;
}

function formatCompactNumber(value: number) {
	const absValue = Math.abs(value);
	const sign = value < 0 ? '-' : '';
	const units = [
		{ label: 'bi', value: 1_000_000_000 },
		{ label: 'mi', value: 1_000_000 },
		{ label: 'mil', value: 1_000 },
	] as const;

	const unit = units.find((item) => absValue >= item.value);
	if (!unit) {
		return `${sign}${formatCount(absValue)}`;
	}

	const scaledValue = absValue / unit.value;
	const formattedValue = scaledValue
		.toFixed(scaledValue >= 100 ? 0 : 1)
		.replace('.', ',')
		.replace(',0', '');

	return `${sign}${formattedValue} ${unit.label}`;
}

function formatCurrency(value: number) {
	return `R$ ${formatCount(value)}`;
}

function formatCompactCurrency(value: number) {
	return `R$ ${formatCompactNumber(value)}`;
}

function getConversionRate(converted: number, total: number) {
	if (total <= 0) {
		return 0;
	}
	return Math.round((converted / total) * 100);
}

function getRankedDistribution(items: DistributionItem[]) {
	const ranked = [...items].sort((left, right) => {
		return right.count - left.count || left.label.localeCompare(right.label);
	});

	if (ranked.length <= MAX_VISIBLE_DISTRIBUTION_ITEMS) {
		return ranked;
	}

	const visibleItems = ranked.slice(0, MAX_VISIBLE_DISTRIBUTION_ITEMS - 1);
	const otherCount = ranked
		.slice(MAX_VISIBLE_DISTRIBUTION_ITEMS - 1)
		.reduce((total, item) => total + item.count, 0);

	return [...visibleItems, { count: otherCount, label: 'Outros' }];
}

function BrazilCoverageMap({
	coverageDistribution,
}: {
	coverageDistribution: DistributionItem[];
}) {
	const [hoveredState, setHoveredState] = useState<string | null>(null);
	const [selectedState, setSelectedState] = useState<string | null>(null);
	const countByState = new Map(
		coverageDistribution.map((item) => [item.label, item.count] as const),
	);
	const maxCount = Math.max(
		0,
		...coverageDistribution.map((item) => item.count),
	);
	const firstStateWithLeads =
		coverageDistribution.find((item) => item.count > 0)?.label ?? null;
	const activeStateCode =
		hoveredState ??
		selectedState ??
		firstStateWithLeads ??
		coverageDistribution.at(0)?.label ??
		null;
	const activeState = activeStateCode
		? brazilMapStates.find((state) => state.code === activeStateCode)
		: null;
	const activeStateCount = activeStateCode
		? (countByState.get(activeStateCode) ?? 0)
		: 0;

	return (
		<div className="flex h-full flex-col gap-3">
			<div className="relative mx-auto h-72 w-full max-w-[460px]">
				<svg
					aria-label="Mapa do Brasil com intensidade de cobertura por estado"
					className="h-full w-full overflow-visible drop-shadow-[0_10px_18px_rgba(16,24,40,0.06)]"
					preserveAspectRatio="xMidYMid meet"
					role="img"
					shapeRendering="geometricPrecision"
					viewBox={brazilMapViewBox}
				>
					<title>Mapa do Brasil com intensidade de cobertura por estado</title>
					{brazilMapStates.map((state) => {
						const count = countByState.get(state.code) ?? 0;
						const isActive = state.code === activeStateCode;
						return (
							<path
								aria-label={`${state.name}: ${getLeadStateLabel(count)}`}
								className="cursor-pointer transition-colors duration-150 focus:outline-none"
								d={state.path}
								fill={getStateFill(count, maxCount)}
								key={state.code}
								onBlur={() => setHoveredState(null)}
								onClick={() => setSelectedState(state.code)}
								onFocus={() => setHoveredState(state.code)}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										setSelectedState(state.code);
									}
								}}
								onMouseEnter={() => setHoveredState(state.code)}
								onMouseLeave={() => setHoveredState(null)}
								role="button"
								stroke={isActive ? '#f4511e' : '#d8e0ea'}
								strokeLinejoin="round"
								strokeWidth={isActive ? '2.8' : '1.2'}
								tabIndex={0}
								vectorEffect="non-scaling-stroke"
							>
								<title>
									{state.name}: {getLeadStateLabel(count)}
								</title>
							</path>
						);
					})}
				</svg>
			</div>
			<div className="mt-auto flex items-center justify-between rounded-2xl border border-[#dfe7f1] bg-white px-4 py-3">
				<div>
					<p className="text-sm font-semibold text-[#101828]">
						{activeState?.name ?? 'Sem estado selecionado'}
					</p>
					<p className="text-xs text-[#667085]">Cobertura operacional</p>
				</div>
				<span className="rounded-full bg-[#fff3ee] px-3 py-1 text-sm font-bold text-[#f4511e]">
					{getLeadStateLabel(activeStateCount)}
				</span>
			</div>
		</div>
	);
}

function StoresDistributionCard({
	distribution,
	storesCount,
}: StoresDistributionCardProps) {
	const distributionRows = getRankedDistribution(distribution);
	const maxDistributionCount = Math.max(
		0,
		...distributionRows.map((item) => item.count),
	);

	return (
		<Card className="h-full rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="flex h-full flex-col space-y-4 p-5">
				<div>
					<h2 className="text-base font-bold text-[#101828]">
						Distribuição por região
					</h2>
					<p className="text-xs text-[#667085]">
						Ranking de lojas por estado atendido.
					</p>
				</div>
				<div className="flex flex-1 flex-col justify-center">
					<div className="space-y-3">
						{distributionRows.length > 0 ? (
							distributionRows.map((item) => {
								const percentage = storesCount
									? Math.round((item.count / storesCount) * 100)
									: 0;
								const barSize = maxDistributionCount
									? Math.max((item.count / maxDistributionCount) * 100, 5)
									: 0;
								return (
									<div className="space-y-2" key={item.label}>
										<div className="flex items-center justify-between gap-3 text-xs">
											<span className="font-semibold text-[#1f2a44]">
												{item.label}
											</span>
											<span className="shrink-0 font-semibold text-[#1f2a44]">
												{percentage}%{' '}
												<span className="font-medium text-[#667085]">
													({formatCount(item.count)})
												</span>
											</span>
										</div>
										<div className="h-2 overflow-hidden rounded-full bg-[#eef2f6]">
											<div
												className="h-full rounded-full bg-[#f4511e] shadow-[0_4px_10px_rgba(244,81,30,0.22)]"
												style={{ width: `${barSize}%` }}
											/>
										</div>
									</div>
								);
							})
						) : (
							<p className="text-xs text-[#667085]">
								Nenhuma região cadastrada.
							</p>
						)}
					</div>
					<div className="mt-4 flex items-center justify-between border-[#eef2f6] border-t pt-3 text-xs">
						<span className="text-[#667085]">Total de lojas</span>
						<span className="font-bold text-[#101828]">
							{formatCount(storesCount)}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function StoresOperationalHighlightsCard({
	averageLeads,
	topConvertedStore,
	topRevenueStore,
	topStore,
	totalConvertedLeads,
	totalLeadCount,
	totalWonValue,
}: StoresOperationalHighlightsCardProps) {
	const globalConversionRate = getConversionRate(
		totalConvertedLeads,
		totalLeadCount,
	);
	const topConvertedRate = topConvertedStore
		? getConversionRate(
				topConvertedStore.convertedLeadCount,
				topConvertedStore.leadCount,
			)
		: 0;
	const averageWonValue = totalConvertedLeads
		? totalWonValue / totalConvertedLeads
		: 0;

	return (
		<Card className="h-full rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="flex h-full flex-col space-y-4 p-5">
				<h2 className="text-base font-bold text-[#101828]">
					Destaques operacionais
				</h2>
				<div className="grid flex-1 gap-3 sm:grid-cols-2">
					<div className="rounded-2xl border border-[#dfe7f1] bg-white p-3.5">
						<div className="mb-3 flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-full bg-white text-[#f4511e]">
								<Star className="size-4" />
							</div>
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#f4511e]">
									Mais leads
								</p>
								<p className="text-xs text-[#667085]">Volume captado</p>
							</div>
						</div>
						<div className="flex items-end justify-between gap-3">
							<p className="min-w-0 text-sm font-bold text-[#101828]">
								{topStore?.store.name ?? 'Sem dados'}
							</p>
							<div className="text-right">
								<p className="text-xl font-bold text-[#101828]">
									{formatCount(topStore?.leadCount ?? 0)}
								</p>
								<p className="text-xs text-[#667085]">leads</p>
							</div>
						</div>
						<p className="mt-3 text-xs text-[#667085]">
							{formatCount(averageLeads)} leads em média por loja
						</p>
					</div>

					<div className="rounded-2xl border border-[#dfe7f1] bg-white p-3.5">
						<div className="mb-3 flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-full bg-white text-[#079455]">
								<CheckCircle2 className="size-4" />
							</div>
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#079455]">
									Conversões
								</p>
								<p className="text-xs text-[#667085]">Leads concluídos</p>
							</div>
						</div>
						<div className="flex items-end justify-between gap-3">
							<p className="min-w-0 text-sm font-bold text-[#101828]">
								{topConvertedStore?.store.name ?? 'Sem dados'}
							</p>
							<div className="text-right">
								<p className="text-xl font-bold text-[#101828]">
									{formatCount(topConvertedStore?.convertedLeadCount ?? 0)}
								</p>
								<p className="text-xs text-[#667085]">
									{topConvertedRate}% da loja
								</p>
							</div>
						</div>
						<p className="mt-3 text-xs text-[#667085]">
							{formatCount(totalConvertedLeads)} concluídos no catálogo ·{' '}
							{globalConversionRate}% geral
						</p>
					</div>

					<div className="rounded-2xl border border-[#dfe7f1] bg-white p-3.5 sm:col-span-2">
						<div className="mb-3 flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-full bg-white text-[#f59e0b]">
								<BadgeDollarSign className="size-4" />
							</div>
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#f59e0b]">
									Receita ganha
								</p>
								<p className="text-xs text-[#667085]">Negociações concluídas</p>
							</div>
						</div>
						<div className="space-y-2.5">
							<div className="rounded-xl border border-[#eef2f6] bg-white px-3 py-2.5">
								<p className="text-xs font-semibold text-[#667085]">
									Loja com maior receita
								</p>
								<p className="mt-1 truncate text-sm font-bold text-[#101828]">
									{topRevenueStore?.store.name ?? 'Sem receita'}
								</p>
								<p
									className="mt-2 text-lg font-bold text-[#101828]"
									title={formatCurrency(topRevenueStore?.wonValue ?? 0)}
								>
									{formatCompactCurrency(topRevenueStore?.wonValue ?? 0)}
								</p>
								<p className="text-xs text-[#667085]">maior valor ganho</p>
							</div>
							<div className="space-y-2 rounded-xl border border-[#eef2f6] bg-white px-3 py-2.5">
								<div className="flex items-start justify-between gap-3">
									<p className="text-xs text-[#667085]">total ganho</p>
									<p
										className="shrink-0 text-sm font-bold text-[#101828]"
										title={formatCurrency(totalWonValue)}
									>
										{formatCompactCurrency(totalWonValue)}
									</p>
								</div>
								<div className="flex items-start justify-between gap-3">
									<p className="text-xs text-[#667085]">ticket médio</p>
									<p
										className="shrink-0 text-sm font-bold text-[#101828]"
										title={formatCurrency(averageWonValue)}
									>
										{formatCompactCurrency(averageWonValue)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function StoresCoverageCard({
	coverageDistribution,
	storesCount,
	uniqueStatesCount,
}: StoresCoverageCardProps) {
	return (
		<Card className="h-full rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="flex h-full flex-col space-y-4 p-5">
				<h2 className="text-base font-bold text-[#101828]">Cobertura atual</h2>
				<div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_108px] xl:grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_108px]">
					<div className="min-w-0">
						<BrazilCoverageMap coverageDistribution={coverageDistribution} />
					</div>
					<div className="grid grid-cols-3 gap-3 lg:block lg:space-y-4 xl:grid xl:grid-cols-3 xl:space-y-0 2xl:block 2xl:space-y-4">
						<div>
							<p className="text-xl font-bold text-[#101828]">
								{uniqueStatesCount}
							</p>
							<p className="text-xs text-[#667085]">estados</p>
						</div>
						<div>
							<p className="text-xl font-bold text-[#101828]">{storesCount}</p>
							<p className="text-xs text-[#667085]">lojas atendidas</p>
						</div>
						<div>
							<p className="text-xl font-bold text-[#101828]">100%</p>
							<p className="text-xs text-[#667085]">das operações</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function StoresInsightsAside({
	averageLeads,
	coverageDistribution,
	storesCount,
	topConvertedStore,
	topRevenueStore,
	topStore,
	totalConvertedLeads,
	totalLeadCount,
	totalWonValue,
	uniqueStatesCount,
}: StoresInsightsAsideProps) {
	return (
		<section className="grid items-stretch gap-5 xl:grid-cols-2">
			<StoresOperationalHighlightsCard
				averageLeads={averageLeads}
				topConvertedStore={topConvertedStore}
				topRevenueStore={topRevenueStore}
				topStore={topStore}
				totalConvertedLeads={totalConvertedLeads}
				totalLeadCount={totalLeadCount}
				totalWonValue={totalWonValue}
			/>
			<StoresCoverageCard
				coverageDistribution={coverageDistribution}
				storesCount={storesCount}
				uniqueStatesCount={uniqueStatesCount}
			/>
		</section>
	);
}

export { StoresDistributionCard, StoresInsightsAside };
export type { DistributionItem };
