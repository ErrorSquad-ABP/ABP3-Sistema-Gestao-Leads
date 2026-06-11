'use client';

import {
	ArrowRight,
	CalendarRange,
	LineChart as LineChartIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	LabelList,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/metrics/KpiCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { humanizePageApiError } from '@/lib/http/humanize-api-error';
import { cn } from '@/lib/utils';

import { useAnalyticDashboardQuery } from '../hooks/analytic-dashboard.queries';
import {
	buildAnalyticKpiCards,
	importanceChartColor,
} from '../lib/analytic-dashboard-kpis';
import { validateDraftFilter } from '../lib/analytic-dashboard-filters';
import type {
	AnalyticDashboard,
	AnalyticDashboardFilterMode,
	AnalyticDashboardQuery,
} from '../model/analytic-dashboard.model';
import { AnalyticConversionDetailDialog } from './analytic-conversion-detail-dialog';
import { AnalyticImportanceDetailDialog } from './analytic-importance-detail-dialog';

const FILTER_OPTIONS: {
	value: AnalyticDashboardFilterMode;
	label: string;
}[] = [
	{ value: 'week', label: 'Semana' },
	{ value: 'month', label: 'Mês' },
	{ value: 'year', label: 'Ano' },
	{ value: 'custom', label: 'Personalizado' },
];

const IMPORTANCE_LABELS = new Map([
	['COLD', 'Frias'],
	['WARM', 'Mornas'],
	['HOT', 'Quentes'],
]);
const REASON_LABELS = new Map([
	['NO_INTEREST', 'Sem interesse'],
	['PRICE_EXPECTATION', 'Preço fora da expectativa'],
	['BOUGHT_ELSEWHERE', 'Comprou em outra loja'],
	['NO_RESPONSE', 'Não retornou contato'],
	['VEHICLE_UNAVAILABLE', 'Veículo indisponível'],
	['OTHER', 'Outros'],
]);
const KPI_SKELETON_KEYS = ['conversion', 'converted', 'lost', 'average-time'];

type TooltipPayloadItem = {
	readonly color?: string;
	readonly dataKey?: string | number;
	readonly name?: string | number;
	readonly payload?: {
		readonly chartLabel?: string;
		readonly label?: string;
		readonly name?: string;
	};
	readonly value?: string | number | null;
};

type ChartTooltipProps = {
	readonly active?: boolean;
	readonly label?: string | number;
	readonly payload?: readonly TooltipPayloadItem[];
};

type TrendPoint = AnalyticDashboard['trend']['points'][number];

function toDateInputValue(date: Date) {
	const year = String(date.getFullYear());
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function todayInputValue() {
	return toDateInputValue(new Date());
}

function thirtyDaysAgoInputValue() {
	const date = new Date();
	date.setDate(date.getDate() - 29);
	return toDateInputValue(date);
}

function parseIsoDate(value: string) {
	return new Date(`${value}T00:00:00.000Z`);
}

function formatCount(value: number) {
	return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercent(value: number) {
	return `${new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: 1,
		minimumFractionDigits: 0,
	}).format(value)}%`;
}

function formatDateShort(value: string) {
	const [year, month, day] = value.split('-');
	return `${day}/${month}/${year}`;
}

function getErrorMessage(error: unknown) {
	return humanizePageApiError(error);
}

function getPeriodLabel(dashboard: AnalyticDashboard | undefined) {
	if (!dashboard) {
		return 'Período selecionado';
	}

	return `${formatDateShort(dashboard.filter.startDate)} - ${formatDateShort(
		dashboard.filter.endDate,
	)}`;
}

function getImportanceLabel(key: string) {
	return IMPORTANCE_LABELS.get(key) ?? key;
}

function getReasonLabel(key: string) {
	return REASON_LABELS.get(key) ?? key;
}

function getReasonChartLabel(label: string) {
	switch (label) {
		case 'Preço fora da expectativa':
			return 'Preço';
		case 'Não retornou contato':
			return 'Não retornou';
		case 'Comprou em outra loja':
			return 'Outra loja';
		case 'Veículo indisponível':
			return 'Veículo indisponível';
		default:
			return label;
	}
}

function normalizeChartValue(value: number, max: number) {
	if (max <= 0) {
		return 0;
	}

	return Math.max(5, (value / max) * 100);
}

function bucketTrend(points: readonly TrendPoint[]) {
	if (points.length <= 45) {
		return points.map((point) => ({
			label: formatDateShort(point.date),
			totalLeads: point.totalLeads,
			convertedLeads: point.convertedLeads,
			lostLeads: point.lostLeads,
			conversionRate: point.conversionRate,
			averageTimeToFirstInteractionHours:
				point.averageTimeToFirstInteractionHours,
		}));
	}

	const buckets = new Map<
		string,
		{
			totalLeads: number;
			convertedLeads: number;
			lostLeads: number;
			averageTimeSum: number;
			averageTimeCount: number;
		}
	>();

	for (const point of points) {
		const date = parseIsoDate(point.date);
		const key =
			points.length > 120
				? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
				: `Sem ${Math.ceil(date.getUTCDate() / 7)}/${String(
						date.getUTCMonth() + 1,
					).padStart(2, '0')}`;
		const current = buckets.get(key) ?? {
			totalLeads: 0,
			convertedLeads: 0,
			lostLeads: 0,
			averageTimeSum: 0,
			averageTimeCount: 0,
		};

		current.totalLeads += point.totalLeads;
		current.convertedLeads += point.convertedLeads;
		current.lostLeads += point.lostLeads;

		if (point.averageTimeToFirstInteractionHours != null) {
			current.averageTimeSum += point.averageTimeToFirstInteractionHours;
			current.averageTimeCount += 1;
		}

		buckets.set(key, current);
	}

	return Array.from(buckets.entries()).map(([label, bucket]) => {
		const finalized = bucket.convertedLeads + bucket.lostLeads;
		return {
			label,
			totalLeads: bucket.totalLeads,
			convertedLeads: bucket.convertedLeads,
			lostLeads: bucket.lostLeads,
			conversionRate:
				finalized > 0 ? (bucket.convertedLeads / finalized) * 100 : 0,
			averageTimeToFirstInteractionHours:
				bucket.averageTimeCount > 0
					? bucket.averageTimeSum / bucket.averageTimeCount
					: null,
		};
	});
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
	if (!active || !payload?.length) {
		return null;
	}

	const firstItem = payload[0];
	const title =
		firstItem?.payload?.label ??
		firstItem?.payload?.name ??
		(label == null ? null : String(label));

	return (
		<div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
			{title ? (
				<p className="mb-2 font-semibold text-foreground">{title}</p>
			) : null}
			<div className="space-y-1 text-muted-foreground">
				{payload.map((item) => {
					const itemName =
						item.name ??
						item.payload?.label ??
						item.payload?.name ??
						item.dataKey ??
						'Valor';

					return (
						<div key={`${item.dataKey}-${itemName}`} className="flex gap-2">
							<span
								className="mt-1 size-2 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
							<span>
								{String(itemName)}: {formatCount(Number(item.value ?? 0))}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function KpiSkeleton() {
	return (
		<Card className="border-border/90 bg-card shadow-sm">
			<CardContent className="space-y-4 p-5">
				<Skeleton className="size-12 rounded-2xl" />
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-10 w-24" />
				<Skeleton className="h-4 w-44" />
			</CardContent>
		</Card>
	);
}

function SectionTitle({ title }: { title: string }) {
	return <h2 className="text-base font-bold text-foreground">{title}</h2>;
}

function CardAction({
	children,
	onClick,
}: {
	children: string;
	onClick?: () => void;
}) {
	if (onClick) {
		return (
			<button
				className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[color:var(--brand-accent)] transition hover:text-[color:var(--brand-accent-hover)]"
				onClick={onClick}
				type="button"
			>
				{children}
				<ArrowRight className="size-3" />
			</button>
		);
	}

	return (
		<span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[color:var(--brand-accent)]">
			{children}
			<ArrowRight className="size-3" />
		</span>
	);
}

function DonutCenter({ total }: { total: number }) {
	return (
		<div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
			<div>
				<p className="text-2xl leading-none font-bold text-foreground">
					{formatCount(total)}
				</p>
				<p className="mt-1 text-[10px] font-semibold text-muted-foreground">
					Total
				</p>
			</div>
		</div>
	);
}

type AnalyticDashboardPageContentProps = {
	user: AuthenticatedUser;
};

function AnalyticDashboardPageContent({
	user,
}: AnalyticDashboardPageContentProps) {
	const [mode, setMode] = useState<AnalyticDashboardFilterMode>('month');
	const [referenceDate, setReferenceDate] = useState(todayInputValue);
	const [startDate, setStartDate] = useState(thirtyDaysAgoInputValue);
	const [endDate, setEndDate] = useState(todayInputValue);
	const [validationMessage, setValidationMessage] = useState<string | null>(
		null,
	);
	const [importanceDialogOpen, setImportanceDialogOpen] = useState(false);
	const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
	const [query, setQuery] = useState<AnalyticDashboardQuery>({
		mode: 'month',
		referenceDate,
		top: 8,
	});

	const dashboardQuery = useAnalyticDashboardQuery(query);
	const dashboard = dashboardQuery.data;

	const trendData = useMemo(
		() => bucketTrend(dashboard?.trend.points ?? []),
		[dashboard?.trend.points],
	);
	const teamDistribution = useMemo(
		() => dashboard?.byTeam.slice(0, 5) ?? [],
		[dashboard?.byTeam],
	);
	const attendantDistribution = useMemo(
		() => dashboard?.byAttendant.slice(0, 8) ?? [],
		[dashboard?.byAttendant],
	);
	const finalizationData = useMemo(
		() =>
			(dashboard?.finalizationReasons ?? []).map((item) => ({
				...item,
				label: getReasonLabel(item.key),
				chartLabel: getReasonChartLabel(getReasonLabel(item.key)),
			})),
		[dashboard?.finalizationReasons],
	);
	const importanceData = useMemo(
		() =>
			(dashboard?.importanceDistribution ?? []).map((item) => ({
				...item,
				label: getImportanceLabel(item.key),
				color: importanceChartColor(item.key),
			})),
		[dashboard?.importanceDistribution],
	);
	const conversionSplit = useMemo(
		() =>
			dashboard
				? [
						{
							key: 'converted',
							label: 'Convertidos',
							count: dashboard.summary.convertedLeads,
							color: CHART_COLORS.performanceOk,
						},
						{
							key: 'notConverted',
							label: 'Não convertidos',
							count: dashboard.summary.notConvertedLeads,
							color: CHART_COLORS.performanceBelow,
						},
					]
				: [],
		[dashboard],
	);

	const hasData = Boolean(dashboard && dashboard.summary.totalLeads > 0);

	function applyFilter(nextMode = mode) {
		const message = validateDraftFilter(user, nextMode, startDate, endDate);
		setValidationMessage(message);

		if (message) {
			return;
		}

		setQuery(
			nextMode === 'custom'
				? {
						mode: 'custom',
						startDate,
						endDate,
						top: 8,
					}
				: {
						mode: nextMode,
						referenceDate,
						top: 8,
					},
		);
	}

	function selectMode(nextMode: AnalyticDashboardFilterMode) {
		setMode(nextMode);
		if (nextMode !== 'custom') {
			applyFilter(nextMode);
		}
	}

	const kpiCards =
		dashboard && trendData.length > 0
			? buildAnalyticKpiCards(dashboard, trendData)
			: [];

	return (
		<div className="space-y-4 bg-background px-1 pb-4">
			<header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Dashboard Analítico
					</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						Visão estratégica da performance comercial no período selecionado.
					</p>
				</div>

				<div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
					<div className="inline-flex overflow-hidden rounded-[13px] border border-border bg-card">
						{FILTER_OPTIONS.map((option) => (
							<button
								className={cn(
									'h-9 border-r border-border px-4 text-[11px] font-semibold transition last:border-r-0',
									mode === option.value
										? 'bg-[color:var(--brand-accent)] text-white shadow-sm'
										: 'text-foreground hover:bg-muted/50',
								)}
								key={option.value}
								onClick={() => selectMode(option.value)}
								type="button"
							>
								{option.label}
							</button>
						))}
					</div>

					{mode === 'custom' ? (
						<div className="flex flex-wrap items-center gap-2 rounded-[13px] border border-border bg-card p-1.5">
							<Input
								className="h-8 w-36 rounded-xl border-border text-[11px] font-semibold shadow-none"
								onChange={(event) => setStartDate(event.target.value)}
								type="date"
								value={startDate}
							/>
							<span className="text-muted-foreground">-</span>
							<Input
								className="h-8 w-36 rounded-xl border-border text-[11px] font-semibold shadow-none"
								onChange={(event) => setEndDate(event.target.value)}
								type="date"
								value={endDate}
							/>
							<Button
								className="h-8 rounded-xl bg-[color:var(--brand-accent)] px-3.5 text-[11px] text-white hover:bg-[color:var(--brand-accent-hover)]"
								onClick={() => applyFilter()}
								type="button"
							>
								Aplicar
							</Button>
						</div>
					) : (
						<label className="flex h-9 cursor-pointer items-center gap-2 rounded-[13px] border border-border bg-card px-3 text-[11px] font-semibold text-foreground">
							<CalendarRange className="size-3.5 text-muted-foreground" />
							<span>{getPeriodLabel(dashboard)}</span>
							<Input
								className="sr-only"
								onChange={(event) => {
									setReferenceDate(event.target.value);
									setQuery({
										mode,
										referenceDate: event.target.value,
										top: 8,
									});
								}}
								type="date"
								value={referenceDate}
							/>
						</label>
					)}
				</div>
			</header>

			{validationMessage ? (
				<Alert className="border-[color:var(--brand-accent-muted)] bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-accent-hover)]">
					<AlertTitle>Filtro inválido</AlertTitle>
					<AlertDescription>{validationMessage}</AlertDescription>
				</Alert>
			) : null}

			{dashboardQuery.error ? (
				<Alert variant="destructive">
					<AlertTitle>Erro ao carregar indicadores</AlertTitle>
					<AlertDescription>
						{getErrorMessage(dashboardQuery.error)}
					</AlertDescription>
				</Alert>
			) : null}

			<section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
				{dashboardQuery.isPending
					? KPI_SKELETON_KEYS.map((key) => <KpiSkeleton key={key} />)
					: kpiCards.map((card) => (
							<KpiCard
								delta={card.delta}
								icon={card.icon}
								key={card.key}
								sparkline={card.sparkline}
								sparklineLabel={card.sparklineLabel}
								title={card.title}
								value={card.value}
								variant={card.variant}
							/>
						))}
			</section>

			{dashboard && !hasData ? (
				<Card className="rounded-[18px] border-border bg-card shadow-sm">
					<CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
						<LineChartIcon className="size-10 text-muted-foreground" />
						<div>
							<h2 className="text-xl font-bold text-foreground">
								Sem dados no período
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Altere o filtro temporal para visualizar os indicadores
								analíticos.
							</p>
						</div>
					</CardContent>
				</Card>
			) : null}

			{dashboard ? (
				<>
					<section className="grid gap-4 xl:grid-cols-[1fr_1.05fr_1fr]">
						<Card className="min-h-[300px] rounded-[18px] border-border bg-card shadow-sm">
							<CardContent className="flex h-full flex-col p-4">
								<div className="mb-4">
									<SectionTitle title="Leads por equipe" />
								</div>

								<div className="grid flex-1 items-center gap-4 md:grid-cols-[minmax(15rem,1fr)_auto]">
									<div className="relative mx-auto h-64 w-full max-w-[18rem]">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={teamDistribution}
													dataKey="totalLeads"
													innerRadius={70}
													nameKey="name"
													outerRadius={106}
													paddingAngle={2}
													stroke="none"
												>
													{teamDistribution.map((item, index) => (
														<Cell
															fill={chartSeriesColor(index)}
															key={item.id}
														/>
													))}
												</Pie>
												<Tooltip content={<ChartTooltip />} />
											</PieChart>
										</ResponsiveContainer>
										<DonutCenter total={dashboard.summary.totalLeads} />
									</div>
									<div className="w-full space-y-4 md:w-48">
										{teamDistribution.map((item, index) => {
											const percentage =
												dashboard.summary.totalLeads > 0
													? (item.totalLeads / dashboard.summary.totalLeads) *
														100
													: 0;
											return (
												<div
													className="grid grid-cols-[1rem_1fr_auto] items-center gap-3"
													key={item.id}
												>
													<span
														className="size-3 rounded-full"
														style={{
															backgroundColor: chartSeriesColor(index),
														}}
													/>
													<div className="min-w-0">
														<p className="truncate text-sm font-semibold text-foreground">
															{item.name}
														</p>
													</div>
													<span className="text-sm font-semibold text-foreground/80">
														{formatCount(item.totalLeads)} (
														{formatPercent(percentage)})
													</span>
												</div>
											);
										})}
									</div>
								</div>
								<CardAction>Ver desempenho das equipes</CardAction>
							</CardContent>
						</Card>

						<Card className="min-h-[300px] rounded-[18px] border-border bg-card shadow-sm">
							<CardContent className="flex h-full flex-col p-4">
								<div className="mb-4">
									<SectionTitle title="Leads por atendente" />
								</div>
								<div className="flex-1 space-y-3">
									{attendantDistribution.map((item) => (
										<div
											className="grid grid-cols-[2rem_1fr_auto] items-center gap-3"
											key={item.id}
										>
											<div className="grid size-7 place-items-center rounded-full bg-[color:var(--brand-accent-soft)] text-[10px] font-bold text-[color:var(--brand-accent-hover)]">
												{item.name
													.split(' ')
													.slice(0, 2)
													.map((part) => part[0])
													.join('')}
											</div>
											<div className="min-w-0">
												<div className="mb-1 flex items-center justify-between gap-3">
													<p className="truncate text-xs font-semibold text-foreground">
														{item.name}
													</p>
													<span className="text-xs font-bold text-foreground">
														{formatCount(item.totalLeads)}
													</span>
												</div>
												<div className="h-1.5 rounded-full bg-muted">
													<div
														className="h-1.5 rounded-full"
														style={{
															width: `${normalizeChartValue(
																item.totalLeads,
																Math.max(
																	...attendantDistribution.map(
																		(attendant) => attendant.totalLeads,
																	),
																	0,
																),
															)}%`,
															backgroundColor: CHART_COLORS.barDefault,
														}}
													/>
												</div>
											</div>
											<span className="text-[11px] text-muted-foreground">
												{formatPercent(item.conversionRate)}
											</span>
										</div>
									))}
								</div>
								<CardAction>Ver ranking completo</CardAction>
							</CardContent>
						</Card>

						<Card className="min-h-[300px] rounded-[18px] border-border bg-card shadow-sm">
							<CardContent className="flex h-full flex-col p-4">
								<div className="mb-4">
									<SectionTitle title="Distribuição por importância" />
								</div>

								<div className="grid flex-1 items-center gap-4 md:grid-cols-[minmax(15rem,1fr)_auto]">
									<div className="relative mx-auto h-64 w-full max-w-[18rem]">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={importanceData}
													dataKey="count"
													innerRadius={70}
													nameKey="label"
													outerRadius={106}
													paddingAngle={2}
													stroke="none"
												>
													{importanceData.map((item) => (
														<Cell fill={item.color} key={item.key} />
													))}
												</Pie>
												<Tooltip content={<ChartTooltip />} />
											</PieChart>
										</ResponsiveContainer>
										<DonutCenter total={dashboard.summary.totalLeads} />
									</div>
									<div className="w-full space-y-4 md:w-48">
										{importanceData.map((item) => {
											const percentage =
												dashboard.summary.totalLeads > 0
													? (item.count / dashboard.summary.totalLeads) * 100
													: 0;
											return (
												<div
													className="grid grid-cols-[1rem_1fr_auto] items-center gap-3"
													key={item.key}
												>
													<span
														className="size-3 rounded-full"
														style={{ backgroundColor: item.color }}
													/>
													<span className="text-sm font-semibold text-foreground">
														{item.label}
													</span>
													<span className="text-sm font-semibold text-foreground/80">
														{formatCount(item.count)} (
														{formatPercent(percentage)})
													</span>
												</div>
											);
										})}
									</div>
								</div>
								<CardAction onClick={() => setImportanceDialogOpen(true)}>
									Ver detalhes da importância
								</CardAction>
							</CardContent>
						</Card>
					</section>

					<section className="grid gap-4 xl:grid-cols-[1fr_0.72fr_1.2fr]">
						<Card className="min-h-[360px] rounded-[18px] border-border bg-card shadow-sm">
							<CardContent className="flex h-full flex-col p-4">
								<div className="mb-4">
									<SectionTitle title="Motivos de finalização" />
								</div>

								{finalizationData.length > 0 ? (
									<div className="h-72">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart
												data={finalizationData}
												margin={{ bottom: 20, left: -18, right: 8, top: 18 }}
											>
												<CartesianGrid
													stroke="var(--border)"
													vertical={false}
												/>
												<XAxis
													axisLine={false}
													dataKey="chartLabel"
													fontSize={10}
													height={42}
													interval={0}
													tickMargin={10}
													tickLine={false}
												/>
												<YAxis
													axisLine={false}
													fontSize={11}
													tickLine={false}
												/>
												<Tooltip content={<ChartTooltip />} />
												<Bar
													dataKey="count"
													fill={CHART_COLORS.barDefault}
													maxBarSize={86}
													name="Leads"
													radius={[10, 10, 0, 0]}
												>
													<LabelList
														className="fill-foreground text-[10px] font-bold"
														dataKey="count"
														position="top"
													/>
												</Bar>
											</BarChart>
										</ResponsiveContainer>
									</div>
								) : (
									<div className="grid min-h-64 place-items-center rounded-2xl bg-muted/40 text-center text-sm text-muted-foreground">
										Nenhuma perda com motivo registrado no período.
									</div>
								)}
								<CardAction>Ver todos os motivos</CardAction>
							</CardContent>
						</Card>

						<Card className="min-h-[360px] rounded-[18px] border-border bg-card shadow-sm">
							<CardContent className="flex h-full flex-col p-4">
								<div className="mb-4">
									<SectionTitle title="Leads convertidos vs não convertidos" />
								</div>
								<div className="grid flex-1 items-center gap-4">
									<div className="relative mx-auto h-60 w-full max-w-68">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={conversionSplit}
													dataKey="count"
													innerRadius={66}
													nameKey="label"
													outerRadius={100}
													paddingAngle={2}
													stroke="none"
												>
													{conversionSplit.map((item) => (
														<Cell fill={item.color} key={item.key} />
													))}
												</Pie>
												<Tooltip content={<ChartTooltip />} />
											</PieChart>
										</ResponsiveContainer>
										<DonutCenter total={dashboard.summary.totalLeads} />
									</div>
									<div className="space-y-3">
										{conversionSplit.map((item) => (
											<div
												className="flex items-center justify-between gap-3"
												key={item.key}
											>
												<div className="flex items-center gap-2">
													<span
														className="size-3 rounded-full"
														style={{ backgroundColor: item.color }}
													/>
													<span className="text-sm font-semibold text-foreground">
														{item.label}
													</span>
												</div>
												<span className="text-sm font-semibold text-foreground/80">
													{formatCount(item.count)}
												</span>
											</div>
										))}
									</div>
								</div>
								<CardAction onClick={() => setConversionDialogOpen(true)}>
									Ver detalhes da conversão
								</CardAction>
							</CardContent>
						</Card>

						<Card className="min-h-[360px] rounded-[18px] border-border bg-card shadow-sm">
							<CardContent className="flex h-full flex-col p-4">
								<div className="mb-4">
									<SectionTitle title="Evolução de leads no período" />
								</div>
								<div className="h-72">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart
											data={trendData}
											margin={{ bottom: 0, left: -18, right: 12, top: 18 }}
										>
											<defs>
												<linearGradient
													id="analyticTrend"
													x1="0"
													x2="0"
													y1="0"
													y2="1"
												>
													<stop
														offset="0%"
														stopColor={CHART_COLORS.barDefault}
														stopOpacity={0.22}
													/>
													<stop
														offset="100%"
														stopColor={CHART_COLORS.barDefault}
														stopOpacity={0}
													/>
												</linearGradient>
											</defs>
											<CartesianGrid stroke="var(--border)" vertical={false} />
											<XAxis
												axisLine={false}
												dataKey="label"
												fontSize={11}
												tickLine={false}
											/>
											<YAxis axisLine={false} fontSize={11} tickLine={false} />
											<Tooltip content={<ChartTooltip />} />
											<Area
												dataKey="totalLeads"
												dot={{
													fill: CHART_COLORS.barDefault,
													r: 3,
													stroke: 'var(--card)',
													strokeWidth: 2,
												}}
												fill="url(#analyticTrend)"
												name="Leads"
												stroke={CHART_COLORS.barDefault}
												strokeWidth={2.5}
												type="monotone"
											>
												<LabelList
													className="fill-foreground text-[10px] font-bold"
													dataKey="totalLeads"
													position="top"
												/>
											</Area>
										</AreaChart>
									</ResponsiveContainer>
								</div>
								<CardAction>Ver evolução completa</CardAction>
							</CardContent>
						</Card>
					</section>
				</>
			) : null}

			<AnalyticImportanceDetailDialog
				dashboard={dashboard}
				onOpenChange={setImportanceDialogOpen}
				open={importanceDialogOpen}
			/>
			<AnalyticConversionDetailDialog
				dashboard={dashboard}
				onOpenChange={setConversionDialogOpen}
				open={conversionDialogOpen}
			/>
		</div>
	);
}

export { AnalyticDashboardPageContent };
