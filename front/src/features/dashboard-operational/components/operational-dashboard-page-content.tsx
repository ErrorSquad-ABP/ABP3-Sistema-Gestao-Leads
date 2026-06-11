'use client';

import { Icon } from '@iconify/react';
import {
	CalendarDays,
	CheckCircle2,
	ClipboardList,
	Flame,
	Globe2,
	Phone,
	RefreshCcw,
	Snowflake,
	Store,
	Target,
	TrendingUp,
	UsersRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { KpiCard } from '@/components/metrics/KpiCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
	CHART_COLORS,
	sourceBrandColor,
	statusBarColor,
	storePerformanceColor,
} from '@/lib/charts/chart-colors';
import { buildConicGradientStopsTo100 } from '@/lib/conic-gradient';
import { humanizePageApiError } from '@/lib/http/humanize-api-error';
import { cn } from '@/lib/utils';

import { useOperationalDashboardQuery } from '../hooks/operational-dashboard.queries';
import {
	buildMonthPeriodQuery,
	buildPresetPeriodQuery,
	isValidMonthInput,
	type OperationalDashboardPeriodMode,
	toMonthInputValue,
} from '../lib/operational-dashboard-period';
import type {
	DashboardDistributionItem,
	DashboardStoreDistributionItem,
	OperationalDashboardData,
	OperationalDashboardImportanceKey,
	OperationalDashboardKpi,
	OperationalDashboardQueryInput,
	OperationalDashboardSourceKey,
	OperationalDashboardStatusKey,
	OperationalDashboardTrendPoint,
} from '../model/operational-dashboard.model';

type PeriodSelection = OperationalDashboardPeriodMode;

type SparklineMetric =
	| 'totalLeads'
	| 'activeLeads'
	| 'convertedLeads'
	| 'conversionRate';

type StatusBarRow = {
	key: string;
	label: string;
	count: number;
	percentage: number;
	color: string;
};

type SourceChartItem = {
	color: string;
	count: number;
	icon: ReactNode;
	iconBackground: string;
	key: string;
	label: string;
	percentage: number;
};

const PRESET_LABELS: {
	label: string;
	value: OperationalDashboardPeriodMode;
}[] = [
	{ label: 'Semana', value: 'week' },
	{ label: 'Mês', value: 'month' },
	{ label: 'Ano', value: 'year' },
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatCount(value: number) {
	return value.toLocaleString('pt-BR');
}

function formatPercentage(value: number) {
	return `${value.toLocaleString('pt-BR', {
		maximumFractionDigits: 1,
		minimumFractionDigits: 0,
	})}%`;
}

function formatDelta(kpi: OperationalDashboardKpi) {
	if (kpi.deltaPoints !== null) {
		return `${kpi.deltaPoints > 0 ? '+' : ''}${kpi.deltaPoints.toLocaleString(
			'pt-BR',
			{ maximumFractionDigits: 1 },
		)} p.p.`;
	}

	if (kpi.deltaPercentage === null) {
		return kpi.value > 0 ? 'novo no período' : 'sem variação';
	}

	return `${kpi.deltaPercentage > 0 ? '+' : ''}${kpi.deltaPercentage.toLocaleString(
		'pt-BR',
		{ maximumFractionDigits: 1 },
	)}%`;
}

function getKpiDeltaTone(kpi: OperationalDashboardKpi) {
	if (kpi.delta > 0) {
		return 'positive' as const;
	}

	if (kpi.delta < 0) {
		return 'negative' as const;
	}

	return 'neutral' as const;
}

function formatDateOnly(value: string) {
	const [year, month, day] = value.slice(0, 10).split('-');
	return `${day}/${month}/${year}`;
}

function formatExclusivePeriod(startDateIso: string, endDateIso: string) {
	const exclusiveEnd = new Date(endDateIso);
	const inclusiveEnd = new Date(exclusiveEnd.getTime() - DAY_IN_MS);
	return `${formatDateOnly(startDateIso)} - ${formatDateOnly(
		inclusiveEnd.toISOString(),
	)}`;
}

function getStatusLabel(key: OperationalDashboardStatusKey) {
	switch (key) {
		case 'NEW':
			return 'Novo';
		case 'CONTACTED':
			return 'Contactado';
		case 'QUALIFIED':
			return 'Em negociação';
		case 'DISQUALIFIED':
			return 'Perdido';
		case 'CONVERTED':
			return 'Convertido';
	}
}

function getStatusColor() {
	return statusBarColor();
}

function getSourceLabel(key: OperationalDashboardSourceKey) {
	switch (key) {
		case 'store-visit':
			return 'Visita em Loja';
		case 'phone-call':
			return 'Telefone';
		case 'whatsapp':
			return 'WhatsApp';
		case 'instagram':
			return 'Instagram';
		case 'facebook':
			return 'Facebook';
		case 'mercado-livre':
			return 'Mercado Livre';
		case 'indication':
			return 'Indicação';
		case 'digital-form':
			return 'Site / Formulário';
		case 'other':
			return 'Outros';
	}
}

function getSourceIcon(key: OperationalDashboardSourceKey) {
	switch (key) {
		case 'store-visit':
			return Store;
		case 'phone-call':
			return Phone;
		case 'whatsapp':
			return Phone;
		case 'instagram':
			return Target;
		case 'facebook':
			return UsersRound;
		case 'mercado-livre':
			return ClipboardList;
		case 'indication':
			return UsersRound;
		case 'digital-form':
			return Globe2;
		case 'other':
			return ClipboardList;
	}
}

function getSourceIconElement(
	key: OperationalDashboardSourceKey | 'other-sources',
	color: string,
) {
	switch (key) {
		case 'whatsapp':
			return (
				<Icon
					className="size-3.5 text-[#25d366]"
					icon="simple-icons:whatsapp"
				/>
			);
		case 'instagram':
			return (
				<Icon
					className="size-3.5 text-[#e4405f]"
					icon="simple-icons:instagram"
				/>
			);
		case 'facebook':
			return (
				<Icon
					className="size-3.5 text-[#1877f2]"
					icon="simple-icons:facebook"
				/>
			);
		case 'mercado-livre':
			return (
				<Icon
					className="size-4 text-[#101828]"
					icon="arcticons:mercado-libre"
				/>
			);
		default: {
			const SourceIcon =
				key === 'other-sources' ? ClipboardList : getSourceIcon(key);
			return <SourceIcon className="size-3.5" style={{ color }} />;
		}
	}
}

function getSourceIconBackground(
	key: OperationalDashboardSourceKey | 'other-sources',
	color: string,
) {
	switch (key) {
		case 'whatsapp':
			return '#e7f8ee';
		case 'instagram':
			return '#fff0f5';
		case 'facebook':
			return '#eaf2ff';
		case 'mercado-livre':
			return '#fff7c2';
		default:
			return `${color}18`;
	}
}

function buildSourceChartItems(
	items: DashboardDistributionItem<OperationalDashboardSourceKey>[],
): SourceChartItem[] {
	const sortedSources = [...items]
		.filter((item) => item.count > 0)
		.sort((left, right) => right.count - left.count);

	if (sortedSources.length <= 5) {
		return sortedSources.map((source) => ({
			color: sourceBrandColor(source.key),
			count: source.count,
			icon: getSourceIconElement(source.key, sourceBrandColor(source.key)),
			iconBackground: getSourceIconBackground(
				source.key,
				sourceBrandColor(source.key),
			),
			key: source.key,
			label: getSourceLabel(source.key),
			percentage: source.percentage,
		}));
	}

	const visibleSources = sortedSources.slice(0, 4).map((source) => ({
		color: sourceBrandColor(source.key),
		count: source.count,
		icon: getSourceIconElement(source.key, sourceBrandColor(source.key)),
		iconBackground: getSourceIconBackground(
			source.key,
			sourceBrandColor(source.key),
		),
		key: source.key,
		label: getSourceLabel(source.key),
		percentage: source.percentage,
	}));
	const remainingSources = sortedSources.slice(4);
	const remainingCount = remainingSources.reduce(
		(total, source) => total + source.count,
		0,
	);
	const remainingPercentage = remainingSources.reduce(
		(total, source) => total + source.percentage,
		0,
	);

	return [
		...visibleSources,
		{
			color: CHART_COLORS.neutral,
			count: remainingCount,
			icon: getSourceIconElement('other-sources', CHART_COLORS.neutral),
			iconBackground: getSourceIconBackground(
				'other-sources',
				CHART_COLORS.neutral,
			),
			key: 'other-sources',
			label: 'Outras origens',
			percentage: remainingPercentage,
		},
	];
}

function getImportanceMeta(key: OperationalDashboardImportanceKey) {
	switch (key) {
		case 'COLD':
			return {
				background: 'bg-[#f4f8ff]',
				bar: 'bg-[#2563eb]',
				border: 'border-[#cfe0ff]',
				icon: Snowflake,
				iconColor: 'text-[#2563eb]',
				label: 'Frio',
			};
		case 'WARM':
			return {
				background: 'bg-[#fffaf0]',
				bar: 'bg-[#f97316]',
				border: 'border-[#fed7aa]',
				icon: Flame,
				iconColor: 'text-[#f97316]',
				label: 'Morno',
			};
		case 'HOT':
			return {
				background: 'bg-[#fff5f5]',
				bar: 'bg-[#ef4444]',
				border: 'border-[#fecaca]',
				icon: Flame,
				iconColor: 'text-[#ef4444]',
				label: 'Quente',
			};
	}
}

function getTrendValue(
	point: OperationalDashboardTrendPoint,
	metric: SparklineMetric,
) {
	switch (metric) {
		case 'totalLeads':
			return point.totalLeads;
		case 'activeLeads':
			return point.activeLeads;
		case 'convertedLeads':
			return point.convertedLeads;
		case 'conversionRate':
			return point.conversionRate;
	}
}

function getSparklineValues(
	points: OperationalDashboardTrendPoint[],
	metric: SparklineMetric,
) {
	if (points.length <= 70) {
		return points.map((point) => getTrendValue(point, metric));
	}

	const bucketSize = points.length > 180 ? 30 : 7;
	const values: number[] = [];

	for (let index = 0; index < points.length; index += bucketSize) {
		const bucket = points.slice(index, index + bucketSize);

		if (metric === 'conversionRate') {
			const totalLeads = bucket.reduce(
				(total, point) => total + point.totalLeads,
				0,
			);
			const convertedLeads = bucket.reduce(
				(total, point) => total + point.convertedLeads,
				0,
			);
			values.push(totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0);
			continue;
		}

		values.push(
			bucket.reduce((total, point) => total + getTrendValue(point, metric), 0),
		);
	}

	return values;
}

function toStatusRows(
	items: DashboardDistributionItem<OperationalDashboardStatusKey>[],
): StatusBarRow[] {
	return items.map((item) => ({
		color: getStatusColor(),
		count: item.count,
		key: item.key,
		label: getStatusLabel(item.key),
		percentage: item.percentage,
	}));
}

function getTopStores(items: DashboardStoreDistributionItem[]) {
	return [...items]
		.filter((item) => item.count > 0)
		.sort((left, right) => right.count - left.count)
		.slice(0, 5);
}

function isEmptyDashboard(dashboard: OperationalDashboardData) {
	return dashboard.totals.totalLeads === 0;
}

function Sparkline({
	color,
	metric,
	points,
}: {
	color: string;
	metric: SparklineMetric;
	points: OperationalDashboardTrendPoint[];
}) {
	const values = getSparklineValues(points, metric);
	const max = Math.max(...values, 1);
	const min = Math.min(...values, 0);
	const range = Math.max(max - min, 1);
	const path = values
		.map((value, index) => {
			const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * 136;
			const y = 44 - ((value - min) / range) * 35;
			return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(' ');

	if (values.length === 0) {
		return <div className="h-12 w-32" />;
	}

	return (
		<svg
			aria-hidden="true"
			className="h-12 w-32 overflow-visible"
			focusable="false"
			viewBox="0 0 136 48"
		>
			<path d={`${path} L 136 48 L 0 48 Z`} fill={color} opacity="0.08" />
			<path
				d={path}
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2.5"
			/>
		</svg>
	);
}

function FilterBar({
	monthValue,
	onMonthChange,
	onPresetChange,
	periodLabel,
	periodSelection,
}: {
	monthValue: string;
	onMonthChange: (value: string) => void;
	onPresetChange: (mode: OperationalDashboardPeriodMode) => void;
	periodLabel?: string;
	periodSelection: PeriodSelection;
}) {
	return (
		<div className="flex flex-wrap items-center justify-end gap-2.5">
			<div className="inline-flex overflow-hidden rounded-[13px] border border-[#dbe4ef] bg-white">
				{PRESET_LABELS.map((preset) => (
					<button
						className={cn(
							'h-9 border-r border-[#e6edf5] px-3.5 text-[11px] font-semibold last:border-r-0',
							periodSelection === preset.value
								? 'bg-[#fff3ec] text-[#ff4f1f]'
								: 'text-[#06142b] hover:bg-[#f8fafc]',
						)}
						key={preset.value}
						onClick={() => onPresetChange(preset.value)}
						type="button"
					>
						{preset.label}
					</button>
				))}
			</div>
			<Input
				aria-label="Mes do dashboard operacional"
				className="h-9 w-[142px] rounded-[13px] border-[#dbe4ef] bg-white text-[11px] font-semibold text-[#2d3a56]"
				onChange={(event) => onMonthChange(event.target.value)}
				type="month"
				value={monthValue}
			/>
			<div className="flex h-9 items-center gap-1.5 rounded-[13px] border border-[#dbe4ef] bg-white px-3 text-[11px] font-semibold text-[#2d3a56]">
				<CalendarDays className="size-3 text-[#66708a]" />
				<span>{periodLabel ?? 'Periodo aplicado'}</span>
			</div>
		</div>
	);
}

function StatusCard({ rows }: { rows: StatusBarRow[] }) {
	const maxCount = Math.max(...rows.map((row) => row.count), 1);

	return (
		<Card className="rounded-[18px] border-[#dbe4ef] bg-white shadow-sm">
			<CardContent className="space-y-5 p-4">
				<SectionHeader title="Leads por Status" />
				<div className="space-y-3.5">
					{rows.map((row) => (
						<div
							className="grid grid-cols-[98px_1fr_42px_40px] items-center gap-3"
							key={row.key}
						>
							<span className="text-xs font-medium text-[#34435f]">
								{row.label}
							</span>
							<div className="h-2 overflow-hidden rounded-full bg-[#eef2f7]">
								<div
									className="h-full rounded-full"
									style={{
										background: row.color,
										width: `${Math.max((row.count / maxCount) * 100, row.count > 0 ? 8 : 0)}%`,
									}}
								/>
							</div>
							<span className="text-right font-bold text-[#06142b]">
								{formatCount(row.count)}
							</span>
							<span className="text-right text-xs text-[#40527a]">
								{formatPercentage(row.percentage)}
							</span>
						</div>
					))}
				</div>
				<div className="grid grid-cols-[98px_1fr] gap-3 text-[10px] text-[#66708a]">
					<span />
					<div className="grid grid-cols-5">
						<span>0</span>
						<span>25</span>
						<span>50</span>
						<span>75</span>
						<span className="text-right">100</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function SectionHeader({ title }: { title: string }) {
	return <h2 className="text-base font-bold text-[#06142b]">{title}</h2>;
}

function OriginCard({
	sources,
	totalLeads,
}: {
	sources: DashboardDistributionItem<OperationalDashboardSourceKey>[];
	totalLeads: number;
}) {
	const chartItems = buildSourceChartItems(sources);
	const conicStops = buildConicGradientStopsTo100(chartItems);

	return (
		<Card className="rounded-[18px] border-[#dbe4ef] bg-white shadow-sm">
			<CardContent className="space-y-5 p-4">
				<SectionHeader title="Leads por Origem" />
				<div className="grid items-center gap-5 lg:grid-cols-[200px_1fr]">
					<div className="relative mx-auto flex size-44 items-center justify-center rounded-full">
						<div
							className="absolute inset-0 rounded-full"
							style={{ background: `conic-gradient(${conicStops})` }}
						/>
						<div className="absolute inset-9 rounded-full bg-white shadow-inner" />
						<div className="relative text-center">
							<p className="text-2xl font-bold text-[#06142b]">
								{formatCount(totalLeads)}
							</p>
							<p className="text-xs text-[#66708a]">Total</p>
						</div>
					</div>
					<div className="space-y-3">
						{chartItems.length > 0 ? (
							chartItems.map((source) => {
								return (
									<div
										className="grid grid-cols-[1fr_auto_auto] items-center gap-3"
										key={source.key}
									>
										<div className="flex items-center gap-2">
											<span
												className="flex size-6 items-center justify-center rounded-full"
												style={{ background: source.iconBackground }}
											>
												{source.icon}
											</span>
											<span className="text-[13px] font-medium text-[#34435f]">
												{source.label}
											</span>
										</div>
										<span className="text-[13px] font-bold text-[#06142b]">
											{formatCount(source.count)}
										</span>
										<span className="w-12 text-right text-[13px] text-[#40527a]">
											{formatPercentage(source.percentage)}
										</span>
									</div>
								);
							})
						) : (
							<p className="rounded-2xl border border-dashed border-[#dbe4ef] bg-[#f8fafc] p-5 text-sm text-[#66708a]">
								Nenhuma origem registrada no período.
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function StoresCard({ stores }: { stores: DashboardStoreDistributionItem[] }) {
	const topStores = getTopStores(stores);
	const maxCount = Math.max(...topStores.map((store) => store.count), 1);

	return (
		<Card className="rounded-[18px] border-[#dbe4ef] bg-white shadow-sm">
			<CardContent className="space-y-5 p-4">
				<SectionHeader title="Leads por Loja" />
				{topStores.length > 0 ? (
					<div className="space-y-3.5">
						{topStores.map((store) => (
							<div className="space-y-2" key={store.storeId}>
								<div className="flex items-end justify-between gap-4">
									<div className="min-w-0">
										<p className="truncate text-sm font-bold text-[#06142b]">
											{store.storeName}
										</p>
										<p className="text-[11px] text-[#66708a]">
											{formatPercentage(store.percentage)} dos leads do período
										</p>
									</div>
									<p className="shrink-0 text-right">
										<span className="block text-base font-bold text-[#06142b]">
											{formatCount(store.count)}
										</span>
										<span className="text-xs text-[#66708a]">leads</span>
									</p>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-[#eef2f7]">
									<div
										className="h-full rounded-full"
										style={{
											background: storePerformanceColor(store.percentage / 100),
											width: `${Math.max((store.count / maxCount) * 100, 6)}%`,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="rounded-2xl border border-dashed border-[#dbe4ef] bg-[#f8fafc] p-5 text-sm text-[#66708a]">
						Nenhuma loja com leads no período.
					</p>
				)}
			</CardContent>
		</Card>
	);
}

function ImportanceCard({
	items,
	totalOpenDeals,
}: {
	items: DashboardDistributionItem<OperationalDashboardImportanceKey>[];
	totalOpenDeals: number;
}) {
	return (
		<Card className="h-full rounded-[18px] border-[#dbe4ef] bg-white shadow-sm">
			<CardContent className="flex h-full flex-col p-4">
				<SectionHeader title="Leads por Importância" />
				<div className="mt-5 grid flex-1 gap-3.5 md:grid-cols-3">
					{items.map((item) => {
						const meta = getImportanceMeta(item.key);
						const Icon = meta.icon;
						return (
							<div
								className={cn(
									'flex h-full min-h-[260px] flex-col justify-center rounded-[16px] border p-6',
									meta.background,
									meta.border,
								)}
								key={item.key}
							>
								<div className="flex items-center gap-3">
									<Icon className={cn('size-6', meta.iconColor)} />
									<span className="text-base font-semibold text-[#06142b]">
										{meta.label}
									</span>
								</div>
								<p className="mt-8 text-5xl leading-none font-bold text-[#06142b]">
									{formatCount(item.count)}
								</p>
								<p className="mt-4 text-base text-[#40527a]">
									{formatPercentage(item.percentage)}
								</p>
								<div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/80">
									<div
										className={cn('h-full rounded-full', meta.bar)}
										style={{ width: `${Math.min(item.percentage, 100)}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>
				<p className="mt-4 text-center text-xs text-[#40527a]">
					Total:{' '}
					<span className="font-bold text-[#06142b]">
						{formatCount(totalOpenDeals)}
					</span>{' '}
					leads
				</p>
			</CardContent>
		</Card>
	);
}

function DashboardLoadingState() {
	return (
		<section className="space-y-3.5">
			<div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
				<Skeleton className="h-[116px] rounded-[18px]" />
				<Skeleton className="h-[116px] rounded-[18px]" />
				<Skeleton className="h-[116px] rounded-[18px]" />
				<Skeleton className="h-[116px] rounded-[18px]" />
			</div>
			<div className="grid gap-3.5 xl:grid-cols-2">
				<Skeleton className="h-[286px] rounded-[18px]" />
				<Skeleton className="h-[286px] rounded-[18px]" />
			</div>
		</section>
	);
}

function DashboardErrorState({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) {
	return (
		<Card className="rounded-[18px] border-red-200 bg-white shadow-sm">
			<CardContent className="flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-base font-bold text-[#06142b]">
						Falha ao carregar dashboard operacional
					</p>
					<p className="mt-1 text-sm text-[#66708a]">{message}</p>
				</div>
				<Button
					className="h-9 rounded-xl border-[#dbe4ef] text-xs"
					onClick={onRetry}
					type="button"
					variant="outline"
				>
					<RefreshCcw className="size-3" />
					Tentar novamente
				</Button>
			</CardContent>
		</Card>
	);
}

function EmptyDashboardState() {
	return (
		<Card className="rounded-[18px] border-[#dbe4ef] bg-white shadow-sm">
			<CardContent className="flex flex-col items-center justify-center py-9 text-center">
				<span className="flex size-11 items-center justify-center rounded-full bg-[#fff3ec]">
					<UsersRound className="size-5 text-[#ff4f1f]" />
				</span>
				<p className="mt-3 text-base font-bold text-[#06142b]">
					Sem leads no período selecionado
				</p>
				<p className="mt-1 max-w-xl text-sm text-[#66708a]">
					Os indicadores aparecem automaticamente quando houver leads no recorte
					temporal aplicado.
				</p>
			</CardContent>
		</Card>
	);
}

function OperationalDashboardPageContent() {
	const initialMonth = toMonthInputValue(new Date());
	const [periodSelection, setPeriodSelection] =
		useState<PeriodSelection>('month');
	const [monthValue, setMonthValue] = useState(initialMonth);
	const [queryInput, setQueryInput] = useState<OperationalDashboardQueryInput>(
		() => buildMonthPeriodQuery(initialMonth),
	);
	const dashboardQuery = useOperationalDashboardQuery(queryInput);

	function applyPresetPeriod(mode: OperationalDashboardPeriodMode) {
		setPeriodSelection(mode);
		setQueryInput(
			mode === 'month'
				? buildMonthPeriodQuery(monthValue)
				: buildPresetPeriodQuery(mode),
		);
	}

	function applyMonthPeriod(value: string) {
		setMonthValue(value);

		if (!isValidMonthInput(value)) {
			return;
		}

		setPeriodSelection('month');
		setQueryInput(buildMonthPeriodQuery(value));
	}

	const dashboard = dashboardQuery.data;
	const statusRows = useMemo(
		() => (dashboard ? toStatusRows(dashboard.distributions.byStatus) : []),
		[dashboard],
	);
	const periodLabel = dashboard
		? formatExclusivePeriod(
				dashboard.period.startDate,
				dashboard.period.endDate,
			)
		: undefined;
	const errorMessage = humanizePageApiError(dashboardQuery.error);

	return (
		<section className="space-y-3.5">
			<header className="flex flex-col gap-3.5 xl:flex-row xl:items-start xl:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-[#06142b]">
						Dashboard Operacional
					</h1>
					<p className="mt-1 text-xs text-[#66708a]">
						Acompanhe o desempenho dos leads e da captação.
					</p>
				</div>
				<FilterBar
					monthValue={monthValue}
					onMonthChange={applyMonthPeriod}
					onPresetChange={applyPresetPeriod}
					periodLabel={periodLabel}
					periodSelection={periodSelection}
				/>
			</header>

			{dashboardQuery.isPending ? <DashboardLoadingState /> : null}

			{dashboardQuery.isError ? (
				<DashboardErrorState
					message={errorMessage}
					onRetry={() => dashboardQuery.refetch()}
				/>
			) : null}

			{dashboard ? (
				<>
					<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
						<KpiCard
							delta={{
								label: 'vs. período anterior',
								tone: getKpiDeltaTone(dashboard.kpis.totalLeads),
								value: formatDelta(dashboard.kpis.totalLeads),
							}}
							icon={<UsersRound className="size-5" />}
							sparkline={
								<Sparkline
									color="var(--kpi-icon-brand)"
									metric="totalLeads"
									points={dashboard.trend.points}
								/>
							}
							title="Total de Leads"
							value={formatCount(dashboard.kpis.totalLeads.value)}
							variant="brand"
						/>
						<KpiCard
							delta={{
								label: 'vs. período anterior',
								tone: getKpiDeltaTone(dashboard.kpis.activeLeads),
								value: formatDelta(dashboard.kpis.activeLeads),
							}}
							icon={<TrendingUp className="size-5" />}
							sparkline={
								<Sparkline
									color="var(--kpi-icon-success)"
									metric="activeLeads"
									points={dashboard.trend.points}
								/>
							}
							title="Leads Abertos"
							value={formatCount(dashboard.kpis.activeLeads.value)}
							variant="success"
						/>
						<KpiCard
							delta={{
								label: 'vs. período anterior',
								tone: getKpiDeltaTone(dashboard.kpis.convertedLeads),
								value: formatDelta(dashboard.kpis.convertedLeads),
							}}
							icon={<CheckCircle2 className="size-5" />}
							sparkline={
								<Sparkline
									color="var(--kpi-icon-neutral)"
									metric="convertedLeads"
									points={dashboard.trend.points}
								/>
							}
							title="Leads Convertidos"
							value={formatCount(dashboard.kpis.convertedLeads.value)}
							variant="neutral"
						/>
						<KpiCard
							delta={{
								label: 'vs. período anterior',
								tone: getKpiDeltaTone(dashboard.kpis.conversionRate),
								value: formatDelta(dashboard.kpis.conversionRate),
							}}
							icon={<Target className="size-5" />}
							sparkline={
								<Sparkline
									color="var(--kpi-icon-warning)"
									metric="conversionRate"
									points={dashboard.trend.points}
								/>
							}
							title="Taxa de Conversão"
							value={formatPercentage(dashboard.kpis.conversionRate.value)}
							variant="warning"
						/>
					</div>

					{isEmptyDashboard(dashboard) ? <EmptyDashboardState /> : null}

					<div className="grid gap-3.5 xl:grid-cols-[0.92fr_1.04fr]">
						<StatusCard rows={statusRows} />
						<OriginCard
							sources={dashboard.distributions.bySource}
							totalLeads={dashboard.totals.totalLeads}
						/>
					</div>

					<div className="grid gap-3.5 xl:grid-cols-[0.92fr_1.04fr]">
						<StoresCard stores={dashboard.distributions.byStore} />
						<ImportanceCard
							items={dashboard.distributions.byImportance}
							totalOpenDeals={dashboard.totals.totalLeadsWithOpenDeal}
						/>
					</div>
				</>
			) : null}
		</section>
	);
}

export { OperationalDashboardPageContent };
