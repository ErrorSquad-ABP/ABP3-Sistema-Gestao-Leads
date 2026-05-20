'use client';

import {
	ArrowDown,
	ArrowRight,
	ArrowUp,
	CalendarRange,
	CheckCircle2,
	Clock3,
	LineChart as LineChartIcon,
	Target,
	UserRoundCheck,
	UserRoundX,
	UsersRound,
	XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
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
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError } from '@/lib/http/api-error';

import { useAnalyticDashboardQuery } from '../hooks/analytic-dashboard.queries';
import { validateDraftFilter } from '../lib/analytic-dashboard-filters';
import type {
	AnalyticDashboard,
	AnalyticDashboardFilterMode,
	AnalyticDashboardQuery,
} from '../model/analytic-dashboard.model';

const FILTER_OPTIONS: {
	value: AnalyticDashboardFilterMode;
	label: string;
}[] = [
	{ value: 'week', label: 'Semana' },
	{ value: 'month', label: 'Mes' },
	{ value: 'year', label: 'Ano' },
	{ value: 'custom', label: 'Personalizado' },
];

const TEAM_COLORS = ['#ff5722', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];
const IMPORTANCE_COLORS: Record<string, string> = {
	COLD: '#2f6bed',
	WARM: '#ff7a1a',
	HOT: '#ef4444',
};
const IMPORTANCE_LABELS = new Map([
	['COLD', 'Frias'],
	['WARM', 'Mornas'],
	['HOT', 'Quentes'],
]);
const REASON_LABELS = new Map([
	['NO_INTEREST', 'Sem interesse'],
	['PRICE_EXPECTATION', 'Preco fora da expectativa'],
	['BOUGHT_ELSEWHERE', 'Comprou em outra loja'],
	['NO_RESPONSE', 'Nao retornou contato'],
	['VEHICLE_UNAVAILABLE', 'Veiculo indisponivel'],
	['OTHER', 'Outros'],
]);
const KPI_SKELETON_KEYS = ['conversion', 'converted', 'lost', 'average-time'];

type TooltipPayloadItem = {
	readonly color?: string;
	readonly dataKey?: string | number;
	readonly name?: string | number;
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

function getErrorMessage(error: unknown) {
	if (error instanceof ApiError) {
		return error.message;
	}

	return 'Nao foi possivel carregar o dashboard analitico.';
}

function getPeriodLabel(dashboard: AnalyticDashboard | undefined) {
	if (!dashboard) {
		return 'Periodo selecionado';
	}

	return `${formatDateShort(dashboard.filter.startDate)} - ${formatDateShort(
		dashboard.filter.endDate,
	)}`;
}

function getRoleScopeLabel(scope: AnalyticDashboard['filter']['scope']) {
	switch (scope) {
		case 'attendant':
			return 'Seus leads';
		case 'manager':
			return 'Equipe vinculada';
		case 'general_manager':
			return 'Operacao consolidada';
		case 'full':
			return 'Visao global';
		default:
			return scope;
	}
}

function getImportanceLabel(key: string) {
	return IMPORTANCE_LABELS.get(key) ?? key;
}

function getReasonLabel(key: string) {
	return REASON_LABELS.get(key) ?? key;
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

	return (
		<div className="rounded-xl border border-[#dde6f1] bg-white px-3 py-2 text-xs shadow-lg">
			<p className="mb-2 font-semibold text-[#07142a]">{String(label)}</p>
			<div className="space-y-1 text-[#66708a]">
				{payload.map((item) => (
					<div key={`${item.dataKey}-${item.name}`} className="flex gap-2">
						<span
							className="mt-1 size-2 rounded-full"
							style={{ backgroundColor: item.color }}
						/>
						<span>
							{item.name}: {formatCount(Number(item.value ?? 0))}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

type DeltaBadgeProps = {
	value: string;
	direction: 'up' | 'down' | 'flat';
	tone: 'good' | 'bad' | 'neutral';
};

function DeltaBadge({ direction, tone, value }: DeltaBadgeProps) {
	const Icon =
		direction === 'up'
			? ArrowUp
			: direction === 'down'
				? ArrowDown
				: ArrowRight;
	const toneClass =
		tone === 'good'
			? 'text-[#009966]'
			: tone === 'bad'
				? 'text-[#ef4444]'
				: 'text-[#64748b]';

	return (
		<span
			className={`inline-flex items-center gap-1 font-semibold ${toneClass}`}
		>
			<Icon className="size-3.5" />
			{value}
		</span>
	);
}

type KpiCardProps = {
	title: string;
	value: string;
	subtitle: string;
	icon: typeof Target;
	iconTone: string;
	lineColor: string;
	points: { label: string; value: number }[];
	delta: DeltaBadgeProps;
};

function KpiCard({
	delta,
	icon: Icon,
	iconTone,
	lineColor,
	points,
	subtitle,
	title,
	value,
}: KpiCardProps) {
	return (
		<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
			<CardContent className="grid h-full grid-cols-[auto_1fr_7rem] items-center gap-4 p-5">
				<div className={`rounded-2xl p-3 ${iconTone}`}>
					<Icon className="size-7" />
				</div>
				<div className="min-w-0">
					<p className="text-sm font-semibold text-[#26324c]">{title}</p>
					<p className="mt-2 text-4xl font-bold tracking-tight text-[#07142a]">
						{value}
					</p>
					<p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#66708a]">
						<DeltaBadge {...delta} />
						<span>{subtitle}</span>
					</p>
				</div>
				<div className="h-20">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={points}>
							<Line
								type="monotone"
								dataKey="value"
								stroke={lineColor}
								strokeWidth={2.5}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}

function KpiSkeleton() {
	return (
		<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
			<CardContent className="space-y-4 p-5">
				<Skeleton className="size-12 rounded-2xl bg-[#edf2f7]" />
				<Skeleton className="h-5 w-32 bg-[#edf2f7]" />
				<Skeleton className="h-10 w-24 bg-[#edf2f7]" />
				<Skeleton className="h-4 w-44 bg-[#edf2f7]" />
			</CardContent>
		</Card>
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
			})),
		[dashboard?.finalizationReasons],
	);
	const importanceData = useMemo(
		() =>
			(dashboard?.importanceDistribution ?? []).map((item) => ({
				...item,
				label: getImportanceLabel(item.key),
				color: IMPORTANCE_COLORS[item.key] ?? '#94a3b8',
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
							color: '#22c55e',
						},
						{
							key: 'notConverted',
							label: 'Nao convertidos',
							count: dashboard.summary.notConvertedLeads,
							color: '#ef4444',
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
			? [
					{
						title: 'Taxa de conversao',
						value: formatPercent(dashboard.kpis.conversionRate.value),
						subtitle: 'vs. periodo anterior',
						icon: Target,
						iconTone: 'bg-[#fff1e8] text-[#ff5722]',
						lineColor: '#ff5722',
						points: trendData.map((point) => ({
							label: point.label,
							value: point.conversionRate,
						})),
						delta: {
							value: formatDeltaPoints(
								dashboard.kpis.conversionRate.deltaPoints,
							),
							direction:
								dashboard.kpis.conversionRate.delta > 0
									? 'up'
									: dashboard.kpis.conversionRate.delta < 0
										? 'down'
										: 'flat',
							tone:
								dashboard.kpis.conversionRate.delta > 0
									? 'good'
									: dashboard.kpis.conversionRate.delta < 0
										? 'bad'
										: 'neutral',
						} satisfies DeltaBadgeProps,
					},
					{
						title: 'Leads convertidos',
						value: formatCount(dashboard.kpis.convertedLeads.value),
						subtitle: 'vs. periodo anterior',
						icon: CheckCircle2,
						iconTone: 'bg-[#e9fbf1] text-[#16a34a]',
						lineColor: '#16a34a',
						points: trendData.map((point) => ({
							label: point.label,
							value: point.convertedLeads,
						})),
						delta: {
							value: formatDeltaPercent(
								dashboard.kpis.convertedLeads.deltaPercentage,
							),
							direction:
								dashboard.kpis.convertedLeads.delta > 0
									? 'up'
									: dashboard.kpis.convertedLeads.delta < 0
										? 'down'
										: 'flat',
							tone:
								dashboard.kpis.convertedLeads.delta > 0
									? 'good'
									: dashboard.kpis.convertedLeads.delta < 0
										? 'bad'
										: 'neutral',
						} satisfies DeltaBadgeProps,
					},
					{
						title: 'Leads perdidos',
						value: formatCount(dashboard.kpis.lostLeads.value),
						subtitle: 'vs. periodo anterior',
						icon: XCircle,
						iconTone: 'bg-[#fff0f0] text-[#ef4444]',
						lineColor: '#ef4444',
						points: trendData.map((point) => ({
							label: point.label,
							value: point.lostLeads,
						})),
						delta: {
							value: formatDeltaPercent(
								dashboard.kpis.lostLeads.deltaPercentage,
							),
							direction:
								dashboard.kpis.lostLeads.delta > 0
									? 'up'
									: dashboard.kpis.lostLeads.delta < 0
										? 'down'
										: 'flat',
							tone:
								dashboard.kpis.lostLeads.delta < 0
									? 'good'
									: dashboard.kpis.lostLeads.delta > 0
										? 'bad'
										: 'neutral',
						} satisfies DeltaBadgeProps,
					},
					{
						title: 'Tempo medio ate atendimento',
						value: formatHours(
							dashboard.kpis.averageTimeToFirstInteraction.value,
						),
						subtitle: 'vs. periodo anterior',
						icon: Clock3,
						iconTone: 'bg-[#f4eaff] text-[#8b3ff6]',
						lineColor: '#8b3ff6',
						points: trendData.map((point) => ({
							label: point.label,
							value: point.averageTimeToFirstInteractionHours ?? 0,
						})),
						delta: {
							value: formatDeltaPercent(
								dashboard.kpis.averageTimeToFirstInteraction.deltaPercentage,
							),
							direction:
								dashboard.kpis.averageTimeToFirstInteraction.delta > 0
									? 'up'
									: dashboard.kpis.averageTimeToFirstInteraction.delta < 0
										? 'down'
										: 'flat',
							tone:
								dashboard.kpis.averageTimeToFirstInteraction.delta < 0
									? 'good'
									: dashboard.kpis.averageTimeToFirstInteraction.delta > 0
										? 'bad'
										: 'neutral',
						} satisfies DeltaBadgeProps,
					},
				]
			: [];

	const bannerTone =
		(dashboard?.kpis.conversionRate.deltaPoints ?? 0) > 0
			? 'positive'
			: (dashboard?.kpis.conversionRate.deltaPoints ?? 0) < 0
				? 'negative'
				: 'neutral';

	return (
		<div className="space-y-6 bg-[#f4f7fa] px-1 pb-4">
			<header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div>
					<h1 className="text-4xl font-bold tracking-tight text-[#07142a]">
						Dashboard Analitico
					</h1>
					<p className="mt-2 text-base text-[#66708a]">
						Visao estrategica da performance comercial no periodo selecionado.
					</p>
				</div>

				<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
					<div className="inline-flex overflow-hidden rounded-2xl border border-[#d6e0ec] bg-white">
						{FILTER_OPTIONS.map((option) => (
							<button
								className={`h-12 px-6 text-sm font-semibold transition ${
									mode === option.value
										? 'bg-[#fff0e8] text-[#ff5722]'
										: 'text-[#07142a] hover:bg-[#f8fafc]'
								}`}
								key={option.value}
								onClick={() => selectMode(option.value)}
								type="button"
							>
								{option.label}
							</button>
						))}
					</div>

					{mode === 'custom' ? (
						<div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#d6e0ec] bg-white p-1.5">
							<Input
								className="h-10 w-36 border-0 text-sm font-semibold shadow-none"
								onChange={(event) => setStartDate(event.target.value)}
								type="date"
								value={startDate}
							/>
							<span className="text-[#66708a]">-</span>
							<Input
								className="h-10 w-36 border-0 text-sm font-semibold shadow-none"
								onChange={(event) => setEndDate(event.target.value)}
								type="date"
								value={endDate}
							/>
							<Button
								className="h-10 rounded-xl bg-[#ff5722] px-4 text-white hover:bg-[#e94e1f]"
								onClick={() => applyFilter()}
								type="button"
							>
								Aplicar
							</Button>
						</div>
					) : (
						<label className="flex h-12 items-center gap-2 rounded-2xl border border-[#d6e0ec] bg-white px-4 text-sm font-semibold text-[#07142a]">
							<CalendarRange className="size-4 text-[#66708a]" />
							<Input
								className="h-9 w-36 border-0 p-0 font-semibold shadow-none"
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
				<Alert className="border-[#ffc9b7] bg-[#fff7f3] text-[#9a3412]">
					<AlertTitle>Filtro invalido</AlertTitle>
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
					: kpiCards.map((card) => <KpiCard key={card.title} {...card} />)}
			</section>

			{dashboard && !hasData ? (
				<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
					<CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
						<LineChartIcon className="size-10 text-[#94a3b8]" />
						<div>
							<h2 className="text-xl font-bold text-[#07142a]">
								Sem dados no periodo
							</h2>
							<p className="mt-1 text-sm text-[#66708a]">
								Altere o filtro temporal para visualizar os indicadores
								analiticos.
							</p>
						</div>
					</CardContent>
				</Card>
			) : null}

			{dashboard ? (
				<>
					<section className="grid gap-5 xl:grid-cols-[1fr_1.05fr_1fr]">
						<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
							<CardContent className="p-6">
								<div className="mb-5 flex items-start justify-between gap-3">
									<div>
										<h2 className="text-xl font-bold text-[#07142a]">
											Leads por equipe
										</h2>
										<p className="text-sm text-[#66708a]">
											Distribuicao de leads no escopo atual.
										</p>
									</div>
									<span className="text-right text-xl font-bold text-[#07142a]">
										{formatCount(dashboard.summary.totalLeads)}
										<span className="block text-xs font-medium text-[#66708a]">
											total
										</span>
									</span>
								</div>

								<div className="grid items-center gap-5 md:grid-cols-[13rem_1fr]">
									<div className="h-56">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={teamDistribution}
													dataKey="totalLeads"
													innerRadius={58}
													nameKey="name"
													outerRadius={92}
													paddingAngle={2}
												>
													{teamDistribution.map((item, index) => (
														<Cell
															fill={TEAM_COLORS[index % TEAM_COLORS.length]}
															key={item.id}
														/>
													))}
												</Pie>
												<Tooltip content={<ChartTooltip />} />
											</PieChart>
										</ResponsiveContainer>
									</div>
									<div className="space-y-4">
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
															backgroundColor:
																TEAM_COLORS[index % TEAM_COLORS.length],
														}}
													/>
													<div className="min-w-0">
														<p className="truncate text-sm font-semibold text-[#07142a]">
															{item.name}
														</p>
													</div>
													<span className="text-sm font-semibold text-[#26324c]">
														{formatCount(item.totalLeads)} (
														{formatPercent(percentage)})
													</span>
												</div>
											);
										})}
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
							<CardContent className="p-6">
								<div className="mb-5">
									<h2 className="text-xl font-bold text-[#07142a]">
										Leads por atendente
									</h2>
									<p className="text-sm text-[#66708a]">
										Ranking operacional por responsavel.
									</p>
								</div>
								<div className="space-y-3">
									{attendantDistribution.map((item) => (
										<div
											className="grid grid-cols-[2.2rem_1fr_auto] items-center gap-3"
											key={item.id}
										>
											<div className="grid size-8 place-items-center rounded-full bg-[#edf2f7] text-xs font-bold text-[#66708a]">
												{item.name
													.split(' ')
													.slice(0, 2)
													.map((part) => part[0])
													.join('')}
											</div>
											<div className="min-w-0">
												<div className="mb-1 flex items-center justify-between gap-3">
													<p className="truncate text-sm font-semibold text-[#07142a]">
														{item.name}
													</p>
													<span className="text-sm font-semibold text-[#07142a]">
														{formatCount(item.totalLeads)}
													</span>
												</div>
												<div className="h-2 rounded-full bg-[#edf2f7]">
													<div
														className="h-2 rounded-full bg-[#ff5722]"
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
														}}
													/>
												</div>
											</div>
											<span className="text-sm text-[#66708a]">
												{formatPercent(item.conversionRate)}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
							<CardContent className="p-6">
								<div className="mb-5">
									<h2 className="text-xl font-bold text-[#07142a]">
										Distribuicao por importancia
									</h2>
									<p className="text-sm text-[#66708a]">
										Frio, morno e quente por negociacao.
									</p>
								</div>

								<div className="grid items-center gap-5 md:grid-cols-[13rem_1fr]">
									<div className="h-56">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={importanceData}
													dataKey="count"
													innerRadius={58}
													nameKey="label"
													outerRadius={92}
													paddingAngle={2}
												>
													{importanceData.map((item) => (
														<Cell fill={item.color} key={item.key} />
													))}
												</Pie>
												<Tooltip content={<ChartTooltip />} />
											</PieChart>
										</ResponsiveContainer>
									</div>
									<div className="space-y-4">
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
													<span className="text-sm font-semibold text-[#07142a]">
														{item.label}
													</span>
													<span className="text-sm font-semibold text-[#26324c]">
														{formatCount(item.count)} (
														{formatPercent(percentage)})
													</span>
												</div>
											);
										})}
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					<section className="grid gap-5 xl:grid-cols-[1fr_0.72fr_1.2fr]">
						<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
							<CardContent className="p-6">
								<div className="mb-5">
									<h2 className="text-xl font-bold text-[#07142a]">
										Motivos de finalizacao
									</h2>
									<p className="text-sm text-[#66708a]">
										Apenas perdas encerradas no periodo.
									</p>
								</div>

								{finalizationData.length > 0 ? (
									<div className="h-72">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={finalizationData}>
												<CartesianGrid
													stroke="#edf2f7"
													strokeDasharray="4 4"
													vertical={false}
												/>
												<XAxis
													axisLine={false}
													dataKey="label"
													fontSize={11}
													interval={0}
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
													fill="#ff7a1a"
													name="Leads"
													radius={[10, 10, 0, 0]}
												/>
											</BarChart>
										</ResponsiveContainer>
									</div>
								) : (
									<div className="grid min-h-72 place-items-center rounded-2xl bg-[#f8fafc] text-center text-sm text-[#66708a]">
										Nenhuma perda com motivo registrado no periodo.
									</div>
								)}
							</CardContent>
						</Card>

						<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
							<CardContent className="p-6">
								<div className="mb-5">
									<h2 className="text-xl font-bold text-[#07142a]">
										Convertidos vs nao convertidos
									</h2>
									<p className="text-sm text-[#66708a]">
										Leitura geral dos leads do periodo.
									</p>
								</div>
								<div className="grid items-center gap-4">
									<div className="h-56">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={conversionSplit}
													dataKey="count"
													innerRadius={58}
													nameKey="label"
													outerRadius={92}
													paddingAngle={2}
												>
													{conversionSplit.map((item) => (
														<Cell fill={item.color} key={item.key} />
													))}
												</Pie>
												<Tooltip content={<ChartTooltip />} />
											</PieChart>
										</ResponsiveContainer>
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
													<span className="text-sm font-semibold text-[#07142a]">
														{item.label}
													</span>
												</div>
												<span className="text-sm font-semibold text-[#26324c]">
													{formatCount(item.count)}
												</span>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-3xl border-[#dde6f1] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
							<CardContent className="p-6">
								<div className="mb-5">
									<h2 className="text-xl font-bold text-[#07142a]">
										Evolucao de leads no periodo
									</h2>
									<p className="text-sm text-[#66708a]">
										Serie temporal agregada conforme o intervalo.
									</p>
								</div>
								<div className="h-72">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={trendData}>
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
														stopColor="#ff5722"
														stopOpacity={0.22}
													/>
													<stop
														offset="100%"
														stopColor="#ff5722"
														stopOpacity={0}
													/>
												</linearGradient>
											</defs>
											<CartesianGrid
												stroke="#edf2f7"
												strokeDasharray="4 4"
												vertical={false}
											/>
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
												fill="url(#analyticTrend)"
												name="Leads"
												stroke="#ff5722"
												strokeWidth={2.5}
												type="monotone"
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</section>

					<section className="rounded-3xl border border-[#ffcdbb] bg-[#fff4ee] px-6 py-5">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-4">
								<div className="grid size-14 place-items-center rounded-full bg-white text-[#ff5722]">
									{bannerTone === 'positive' ? (
										<UserRoundCheck className="size-7" />
									) : bannerTone === 'negative' ? (
										<UserRoundX className="size-7" />
									) : (
										<UsersRound className="size-7" />
									)}
								</div>
								<div>
									<h2 className="text-lg font-bold text-[#07142a]">
										{bannerTone === 'positive'
											? 'Performance em destaque'
											: bannerTone === 'negative'
												? 'Conversao exige atencao'
												: 'Performance estavel'}
									</h2>
									<p className="text-sm text-[#66708a]">
										{bannerTone === 'positive'
											? `A taxa de conversao subiu ${formatDeltaPoints(
													dashboard.kpis.conversionRate.deltaPoints,
												)} no periodo.`
											: bannerTone === 'negative'
												? `A taxa de conversao caiu ${formatDeltaPoints(
														dashboard.kpis.conversionRate.deltaPoints,
													)} no periodo.`
												: 'A taxa de conversao ficou sem variacao relevante no periodo.'}
									</p>
								</div>
							</div>
							<div className="text-sm font-semibold text-[#ff5722]">
								{getRoleScopeLabel(dashboard.filter.scope)} -{' '}
								{getPeriodLabel(dashboard)}
							</div>
						</div>
					</section>
				</>
			) : null}

			<p className="text-center text-sm text-[#66708a]">
				Dados calculados pelo backend com validacao temporal e regras de RBAC.
			</p>
		</div>
	);
}

export { AnalyticDashboardPageContent };
