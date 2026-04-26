'use client';

import {
	BarChart3,
	CalendarRange,
	Clock3,
	Filter,
	RefreshCw,
	TrendingUp,
	Users2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	Rectangle,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const ANALYTIC_FILTER_OPTIONS: {
	value: AnalyticDashboardFilterMode;
	label: string;
}[] = [
	{ value: 'week', label: 'Semana' },
	{ value: 'month', label: 'Mes' },
	{ value: 'year', label: 'Ano' },
	{ value: 'custom', label: 'Periodo' },
];

const CHART_COLORS = ['#ff7a45', '#f39c12', '#3498db', '#2d3648'];
const PRIMARY_COLOR = '#ff7a45';
const SECONDARY_COLOR = '#2d3648';
const MUTED_COLOR = '#cfd8e3';

function isoToday() {
	return new Date().toISOString().slice(0, 10);
}

function isoThirtyDaysAgo() {
	return new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);
}

function formatPercent(value: number) {
	return `${value.toFixed(1)}%`;
}

function formatCount(value: number) {
	return new Intl.NumberFormat('pt-BR').format(value);
}

function formatHours(value: number | null) {
	if (value == null) {
		return 'Sem dados';
	}
	return `${value.toFixed(1)}h`;
}

function formatDateLabel(value: string) {
	const [year, month, day] = value.split('-');
	return `${day}/${month}/${year}`;
}

function getScopeLabel(scope: AnalyticDashboard['filter']['scope']) {
	switch (scope) {
		case 'attendant':
			return 'Seus leads';
		case 'manager':
			return 'Equipe e lojas do gestor';
		case 'general_manager':
			return 'Lojas visiveis ao gerente geral';
		case 'full':
			return 'Visao global';
		default:
			return scope;
	}
}

function getRoleCopy(user: AuthenticatedUser) {
	switch (user.role) {
		case 'MANAGER':
			return {
				eyebrow: 'Gestao da equipe',
				title: 'Dashboard analitico comercial',
				subtitle:
					'Acompanhe conversao, desempenho do time e sinais de perda dentro do seu escopo gerencial.',
			};
		case 'GENERAL_MANAGER':
			return {
				eyebrow: 'Visao consolidada',
				title: 'Dashboard analitico multiunidade',
				subtitle:
					'Compare conversao, distribuicao de esforco e qualidade do atendimento entre as lojas visiveis para o seu papel.',
			};
		case 'ADMINISTRATOR':
			return {
				eyebrow: 'Administracao',
				title: 'Dashboard analitico global',
				subtitle:
					'Leia o funil comercial completo com filtros temporais, comparativos e indicadores consolidados do CRM.',
			};
		default:
			return {
				eyebrow: 'Analise',
				title: 'Dashboard analitico',
				subtitle:
					'Indicadores consolidados do funil comercial com o recorte permitido para o seu perfil.',
			};
	}
}

function getTimeModeLabel(mode: AnalyticDashboardFilterMode) {
	return (
		ANALYTIC_FILTER_OPTIONS.find((option) => option.value === mode)?.label ??
		mode
	);
}

function getDashboardErrorMessage(error: unknown) {
	if (!(error instanceof ApiError)) {
		return 'Nao foi possivel carregar o dashboard analitico.';
	}

	if (error.code?.startsWith('dashboard.time_range.')) {
		return error.message;
	}

	return error.message || 'Nao foi possivel carregar o dashboard analitico.';
}

type DashboardTooltipItem = {
	readonly name?: string | number;
	readonly dataKey?: string | number;
	readonly color?: string;
	readonly value?: string | number | null;
};

type DashboardTooltipProps = {
	readonly active?: boolean;
	readonly payload?: readonly DashboardTooltipItem[];
	readonly label?: string | number;
};

function DashboardTooltip({ active, payload, label }: DashboardTooltipProps) {
	if (!active || !payload?.length) {
		return null;
	}

	return (
		<div className="rounded-xl border border-[#e5e9ef] bg-white px-3 py-2 text-xs shadow-lg">
			<p className="mb-2 font-semibold text-[#1f2a38]">{String(label)}</p>
			<div className="space-y-1 text-[#5f6b7a]">
				{payload.map((item) => (
					<div key={`${item.name}-${item.dataKey}`} className="flex gap-2">
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

function MetricCardSkeleton() {
	return (
		<Card className="rounded-2xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
			<CardContent className="space-y-3 p-5">
				<Skeleton className="h-11 w-11 rounded-xl bg-[#edf1f5]" />
				<Skeleton className="h-4 w-28 rounded-md bg-[#edf1f5]" />
				<Skeleton className="h-8 w-24 rounded-md bg-[#edf1f5]" />
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
	const initialReferenceDate = isoToday();
	const [draftMode, setDraftMode] =
		useState<AnalyticDashboardFilterMode>('month');
	const [draftReferenceDate, setDraftReferenceDate] =
		useState(initialReferenceDate);
	const [draftStartDate, setDraftStartDate] = useState(isoThirtyDaysAgo());
	const [draftEndDate, setDraftEndDate] = useState(initialReferenceDate);
	const [localFilterError, setLocalFilterError] = useState<string | null>(null);
	const [appliedQuery, setAppliedQuery] = useState<AnalyticDashboardQuery>({
		mode: 'month',
		referenceDate: initialReferenceDate,
	});

	const dashboardQuery = useAnalyticDashboardQuery(appliedQuery);
	const dashboard = dashboardQuery.data;
	const copy = getRoleCopy(user);

	const topAttendants = useMemo(
		() => (dashboard?.byAttendant ?? []).slice(0, 6),
		[dashboard?.byAttendant],
	);
	const topTeams = useMemo(
		() => (dashboard?.byTeam ?? []).slice(0, 5),
		[dashboard?.byTeam],
	);
	const conversionBarData = useMemo(() => {
		if (!dashboard) {
			return [];
		}
		return [
			{
				name: 'Convertidos',
				valor: dashboard.summary.convertedLeads,
				fill: PRIMARY_COLOR,
			},
			{
				name: 'Nao convertidos',
				valor: dashboard.summary.notConvertedLeads,
				fill: SECONDARY_COLOR,
			},
		];
	}, [dashboard]);
	const importanceData = dashboard?.importanceDistribution ?? [];
	const finalizationData = dashboard?.finalizationReasons ?? [];
	const hasNoData =
		dashboard !== undefined && dashboard.summary.totalLeads === 0;

	const topAttendant = topAttendants[0] ?? null;
	const topTeam = topTeams[0] ?? null;

	function applyFilter() {
		const validationError = validateDraftFilter(
			user,
			draftMode,
			draftStartDate,
			draftEndDate,
		);

		if (validationError) {
			setLocalFilterError(validationError);
			return;
		}

		setLocalFilterError(null);

		if (draftMode === 'custom') {
			setAppliedQuery({
				mode: draftMode,
				startDate: draftStartDate,
				endDate: draftEndDate,
			});
			return;
		}

		setAppliedQuery({
			mode: draftMode,
			referenceDate: draftReferenceDate,
		});
	}

	function resetFilter() {
		setDraftMode('month');
		setDraftReferenceDate(initialReferenceDate);
		setDraftStartDate(isoThirtyDaysAgo());
		setDraftEndDate(initialReferenceDate);
		setLocalFilterError(null);
		setAppliedQuery({
			mode: 'month',
			referenceDate: initialReferenceDate,
		});
	}

	return (
		<div
			className="space-y-6"
			aria-busy={dashboardQuery.isFetching ? 'true' : 'false'}
		>
			<section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1f2a38_0%,#17212c_100%)] px-6 py-6 text-white shadow-[0_16px_40px_rgba(23,33,44,0.12)] md:px-8">
				<div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
					<div className="max-w-3xl space-y-4">
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb192]">
								{copy.eyebrow}
							</p>
							<h1 className="text-[2rem] font-semibold leading-tight tracking-tight md:text-[2.3rem]">
								{copy.title}
							</h1>
							<p className="max-w-2xl text-sm leading-7 text-[#cfd8e3] md:text-[0.95rem]">
								{copy.subtitle}
							</p>
						</div>

						<div className="flex flex-wrap gap-2">
							<Badge
								className="rounded-full border-none bg-white/12 px-3 py-1 text-white"
								variant="secondary"
							>
								{dashboard
									? getScopeLabel(dashboard.filter.scope)
									: 'Escopo carregado pelo backend'}
							</Badge>
							<Badge
								className="rounded-full border-none bg-white/12 px-3 py-1 text-white"
								variant="secondary"
							>
								{dashboard
									? `${formatDateLabel(dashboard.filter.startDate)} ate ${formatDateLabel(
											dashboard.filter.endDate,
										)}`
									: 'Periodo analitico'}
							</Badge>
						</div>
					</div>

					<div className="w-full max-w-xl rounded-2xl bg-white/8 p-4 backdrop-blur">
						<div className="flex flex-wrap gap-2">
							{ANALYTIC_FILTER_OPTIONS.map((option) => (
								<button
									key={option.value}
									className={`h-10 rounded-md px-4 text-sm font-medium transition ${
										draftMode === option.value
											? 'bg-[#ff7a45] text-white'
											: 'bg-white/8 text-[#d9e1eb] hover:bg-white/14'
									}`}
									onClick={() => {
										setDraftMode(option.value);
										setLocalFilterError(null);
									}}
									type="button"
								>
									{option.label}
								</button>
							))}
						</div>

						<div className="mt-4 grid gap-3 md:grid-cols-2">
							{draftMode === 'custom' ? (
								<>
									<label className="space-y-2 text-sm">
										<span className="text-[#d9e1eb]">Data inicial</span>
										<Input
											className="h-11 rounded-md border-white/10 bg-white text-[#1f2a38]"
											onChange={(event) => {
												setDraftStartDate(event.target.value);
												setLocalFilterError(null);
											}}
											type="date"
											value={draftStartDate}
										/>
									</label>
									<label className="space-y-2 text-sm">
										<span className="text-[#d9e1eb]">Data final</span>
										<Input
											className="h-11 rounded-md border-white/10 bg-white text-[#1f2a38]"
											onChange={(event) => {
												setDraftEndDate(event.target.value);
												setLocalFilterError(null);
											}}
											type="date"
											value={draftEndDate}
										/>
									</label>
								</>
							) : (
								<label className="space-y-2 text-sm md:col-span-2">
									<span className="text-[#d9e1eb]">Data de referencia</span>
									<Input
										className="h-11 rounded-md border-white/10 bg-white text-[#1f2a38]"
										onChange={(event) => {
											setDraftReferenceDate(event.target.value);
											setLocalFilterError(null);
										}}
										type="date"
										value={draftReferenceDate}
									/>
								</label>
							)}
						</div>

						<div className="mt-4 flex flex-wrap items-center gap-3">
							<Button
								className="rounded-md bg-[#ff7a45] text-white hover:bg-[#f16d35]"
								onClick={applyFilter}
								type="button"
							>
								<Filter className="size-4" />
								Aplicar filtro
							</Button>
							<Button
								className="rounded-md border-white/14 bg-transparent text-white hover:bg-white/10"
								onClick={() => dashboardQuery.refetch()}
								type="button"
								variant="outline"
							>
								<RefreshCw className="size-4" />
								Atualizar
							</Button>
							<Button
								className="rounded-md border-white/14 bg-transparent text-white hover:bg-white/10"
								onClick={resetFilter}
								type="button"
								variant="outline"
							>
								Resetar
							</Button>
						</div>

						<p className="mt-3 text-xs leading-5 text-[#d9e1eb]">
							{user.role === 'ADMINISTRATOR'
								? 'Administrador pode consultar janelas maiores no modo customizado.'
								: 'Para este perfil, o backend aceita no maximo um ano no modo customizado.'}
						</p>
					</div>
				</div>
			</section>

			{localFilterError ? (
				<Alert variant="warning">
					<AlertTitle>Filtro temporal invalido</AlertTitle>
					<AlertDescription>{localFilterError}</AlertDescription>
				</Alert>
			) : null}

			{dashboardQuery.isError ? (
				<Alert variant="destructive" role="alert">
					<AlertTitle>Falha ao carregar o dashboard</AlertTitle>
					<AlertDescription>
						{getDashboardErrorMessage(dashboardQuery.error)}
					</AlertDescription>
				</Alert>
			) : null}

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{dashboard === undefined && dashboardQuery.isPending ? (
					<>
						<MetricCardSkeleton />
						<MetricCardSkeleton />
						<MetricCardSkeleton />
						<MetricCardSkeleton />
					</>
				) : (
					[
						{
							icon: TrendingUp,
							iconClasses: 'bg-[#fff0e8] text-[#ff7a45]',
							label: 'Taxa de conversao',
							value: dashboard
								? formatPercent(dashboard.summary.conversionRate)
								: '--',
						},
						{
							icon: BarChart3,
							iconClasses: 'bg-[#edf8f2] text-[#2ecc71]',
							label: 'Leads convertidos',
							value: dashboard
								? formatCount(dashboard.summary.convertedLeads)
								: '--',
						},
						{
							icon: Users2,
							iconClasses: 'bg-[#eef3ff] text-[#3498db]',
							label: 'Leads nao convertidos',
							value: dashboard
								? formatCount(dashboard.summary.notConvertedLeads)
								: '--',
						},
						{
							icon: Clock3,
							iconClasses: 'bg-[#f4eefc] text-[#8e5dd9]',
							label: 'Tempo medio ate atendimento',
							value: dashboard
								? formatHours(dashboard.averageTimeToFirstInteraction.hours)
								: '--',
						},
					].map((metric) => (
						<Card
							key={metric.label}
							className="rounded-2xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
						>
							<CardContent className="p-5">
								<div
									className={`mb-3 flex size-11 items-center justify-center rounded-xl ${metric.iconClasses}`}
								>
									<metric.icon className="size-5" />
								</div>
								<p className="text-sm text-[#6c7683]">{metric.label}</p>
								<p className="mt-1 text-[1.8rem] font-semibold text-[#1f2a38]">
									{metric.value}
								</p>
							</CardContent>
						</Card>
					))
				)}
			</section>

			{hasNoData ? (
				<Alert>
					<AlertTitle>Nenhum dado encontrado</AlertTitle>
					<AlertDescription>
						Este periodo nao retornou leads dentro do seu escopo. Ajuste o
						filtro temporal para explorar outra janela de analise.
					</AlertDescription>
				</Alert>
			) : null}

			<section className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.95fr)]">
				<div className="space-y-6">
					<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
						<CardHeader className="pb-4">
							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff7a45]">
									Performance
								</p>
								<CardTitle className="text-[1.35rem] text-[#1f2a38]">
									Ranking por atendente
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{dashboard === undefined && dashboardQuery.isPending ? (
								<Skeleton className="h-[360px] rounded-2xl bg-[#edf1f5]" />
							) : topAttendants.length === 0 ? (
								<div className="rounded-2xl bg-[#f8f9fb] px-4 py-14 text-sm text-[#6c7683]">
									Nao ha dados de atendentes para o periodo selecionado.
								</div>
							) : (
								<>
									<div className="h-[320px] w-full">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart
												data={topAttendants}
												margin={{ left: 0, right: 4, top: 8, bottom: 0 }}
											>
												<CartesianGrid
													stroke="#e9edf2"
													strokeDasharray="3 3"
													vertical={false}
												/>
												<XAxis
													axisLine={false}
													dataKey="name"
													tick={{ fill: '#7a8491', fontSize: 12 }}
													tickLine={false}
												/>
												<YAxis
													allowDecimals={false}
													axisLine={false}
													tick={{ fill: '#7a8491', fontSize: 12 }}
													tickLine={false}
												/>
												<Tooltip content={<DashboardTooltip />} />
												<Legend />
												<Bar
													dataKey="convertedLeads"
													fill={PRIMARY_COLOR}
													name="Convertidos"
													radius={[8, 8, 0, 0]}
												/>
												<Bar
													dataKey="notConvertedLeads"
													fill={SECONDARY_COLOR}
													name="Nao convertidos"
													radius={[8, 8, 0, 0]}
												/>
											</BarChart>
										</ResponsiveContainer>
									</div>

									<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
										{topAttendants.map((attendant) => (
											<div
												key={attendant.id}
												className="rounded-2xl bg-[#f8f9fb] px-4 py-4"
											>
												<p className="text-sm font-semibold text-[#1f2a38]">
													{attendant.name}
												</p>
												<div className="mt-3 flex items-end justify-between gap-3">
													<div>
														<p className="text-[1.3rem] font-semibold text-[#1f2a38]">
															{formatPercent(attendant.conversionRate)}
														</p>
														<p className="text-xs text-[#7a8491]">
															{formatCount(attendant.totalLeads)} leads
														</p>
													</div>
													<div className="text-right text-xs text-[#7a8491]">
														<p>{formatCount(attendant.wonDeals)} ganhas</p>
														<p>{formatCount(attendant.openDeals)} abertas</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</>
							)}
						</CardContent>
					</Card>

					<div className="grid gap-6 lg:grid-cols-2">
						<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
							<CardHeader className="pb-4">
								<div className="space-y-2">
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff7a45]">
										Equipes
									</p>
									<CardTitle className="text-[1.25rem] text-[#1f2a38]">
										Comparativo por equipe
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								{dashboard === undefined && dashboardQuery.isPending ? (
									<Skeleton className="h-[280px] rounded-2xl bg-[#edf1f5]" />
								) : topTeams.length === 0 ? (
									<div className="rounded-2xl bg-[#f8f9fb] px-4 py-12 text-sm text-[#6c7683]">
										Sem dados agregados por equipe neste intervalo.
									</div>
								) : (
									<div className="h-[280px] w-full">
										<ResponsiveContainer width="100%" height="100%">
											<LineChart
												data={topTeams}
												margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
											>
												<CartesianGrid
													stroke="#e9edf2"
													strokeDasharray="3 3"
													vertical={false}
												/>
												<XAxis
													axisLine={false}
													dataKey="name"
													tick={{ fill: '#7a8491', fontSize: 12 }}
													tickLine={false}
												/>
												<YAxis
													allowDecimals={false}
													axisLine={false}
													tick={{ fill: '#7a8491', fontSize: 12 }}
													tickLine={false}
												/>
												<Tooltip content={<DashboardTooltip />} />
												<Line
													dataKey="convertedLeads"
													name="Convertidos"
													stroke={PRIMARY_COLOR}
													strokeWidth={3}
													type="monotone"
													dot={{ fill: PRIMARY_COLOR, r: 4 }}
												/>
												<Line
													dataKey="notConvertedLeads"
													name="Nao convertidos"
													stroke={MUTED_COLOR}
													strokeWidth={3}
													type="monotone"
													dot={{ fill: SECONDARY_COLOR, r: 4 }}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								)}
							</CardContent>
						</Card>

						<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
							<CardHeader className="pb-4">
								<div className="space-y-2">
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff7a45]">
										Leitura rapida
									</p>
									<CardTitle className="text-[1.25rem] text-[#1f2a38]">
										Destaques do periodo
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="rounded-2xl bg-[#f8f9fb] px-4 py-4">
									<p className="text-xs uppercase tracking-[0.18em] text-[#7a8491]">
										Melhor atendente
									</p>
									<p className="mt-2 text-base font-semibold text-[#1f2a38]">
										{topAttendant?.name ?? 'Sem dados'}
									</p>
									<p className="mt-1 text-sm text-[#6c7683]">
										{topAttendant
											? `${formatPercent(topAttendant.conversionRate)} de conversao com ${formatCount(
													topAttendant.totalLeads,
												)} leads no periodo.`
											: 'Nao houve leads suficientes para destacar um atendente.'}
									</p>
								</div>

								<div className="rounded-2xl bg-[#f8f9fb] px-4 py-4">
									<p className="text-xs uppercase tracking-[0.18em] text-[#7a8491]">
										Equipe em destaque
									</p>
									<p className="mt-2 text-base font-semibold text-[#1f2a38]">
										{topTeam?.name ?? 'Sem dados'}
									</p>
									<p className="mt-1 text-sm text-[#6c7683]">
										{topTeam
											? `${formatPercent(topTeam.conversionRate)} de conversao e ${formatCount(
													topTeam.convertedLeads,
												)} leads convertidos.`
											: 'Nao houve volume suficiente para destacar uma equipe.'}
									</p>
								</div>

								<div className="rounded-2xl bg-[#f8f9fb] px-4 py-4">
									<p className="text-xs uppercase tracking-[0.18em] text-[#7a8491]">
										Foco do momento
									</p>
									<p className="mt-2 text-base font-semibold text-[#1f2a38]">
										{importanceData[0]?.label ?? 'Sem dados'}
									</p>
									<p className="mt-1 text-sm text-[#6c7683]">
										{importanceData[0]
											? `${formatCount(importanceData[0].count)} negociacoes concentram a principal faixa de importancia do funil.`
											: 'A distribuicao por importancia ainda nao possui dados no periodo.'}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				<div className="space-y-6">
					<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
						<CardHeader className="pb-4">
							<CardTitle className="text-[1.1rem] text-[#1f2a38]">
								Resumo do funil
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-2xl bg-[#f8f9fb] px-4 py-4">
								<p className="text-xs uppercase tracking-[0.22em] text-[#7a8491]">
									Periodo aplicado
								</p>
								<p className="mt-2 text-sm font-medium text-[#1f2a38]">
									{dashboard
										? `${formatDateLabel(dashboard.filter.startDate)} ate ${formatDateLabel(
												dashboard.filter.endDate,
											)}`
										: '--'}
								</p>
							</div>

							<div className="space-y-3 text-sm text-[#425062]">
								<div className="flex items-center justify-between">
									<span>Total de leads</span>
									<strong className="text-[#1f2a38]">
										{dashboard
											? formatCount(dashboard.summary.totalLeads)
											: '--'}
									</strong>
								</div>
								<div className="flex items-center justify-between">
									<span>Escopo de visualizacao</span>
									<strong className="text-[#1f2a38]">
										{dashboard ? getScopeLabel(dashboard.filter.scope) : '--'}
									</strong>
								</div>
								<div className="flex items-center justify-between">
									<span>Leads com interacao</span>
									<strong className="text-[#1f2a38]">
										{dashboard
											? formatCount(
													dashboard.averageTimeToFirstInteraction
														.leadsWithInteraction,
												)
											: '--'}
									</strong>
								</div>
							</div>

							{dashboard === undefined && dashboardQuery.isPending ? (
								<Skeleton className="h-[220px] rounded-2xl bg-[#edf1f5]" />
							) : (
								<div className="h-[220px] w-full">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={conversionBarData}
											layout="vertical"
											margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
										>
											<CartesianGrid
												horizontal={false}
												stroke="#eceff4"
												strokeDasharray="3 3"
											/>
											<XAxis
												allowDecimals={false}
												axisLine={false}
												tick={{ fill: '#7a8491', fontSize: 12 }}
												tickLine={false}
												type="number"
											/>
											<YAxis
												axisLine={false}
												dataKey="name"
												tick={{ fill: '#7a8491', fontSize: 12 }}
												tickLine={false}
												type="category"
											/>
											<Tooltip content={<DashboardTooltip />} />
											<Bar
												dataKey="valor"
												radius={[0, 8, 8, 0]}
												shape={<Rectangle radius={[0, 8, 8, 0]} />}
											>
												{conversionBarData.map((item) => (
													<Cell key={item.name} fill={item.fill} />
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
						<CardHeader className="pb-4">
							<CardTitle className="text-[1.1rem] text-[#1f2a38]">
								Negociacoes por importancia
							</CardTitle>
						</CardHeader>
						<CardContent>
							{dashboard === undefined && dashboardQuery.isPending ? (
								<Skeleton className="h-[260px] rounded-2xl bg-[#edf1f5]" />
							) : importanceData.length > 0 ? (
								<div className="space-y-5">
									<div className="h-[220px] w-full">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													cx="50%"
													cy="50%"
													data={importanceData}
													dataKey="count"
													innerRadius={56}
													nameKey="label"
													outerRadius={86}
													paddingAngle={3}
												>
													{importanceData.map((item, index) => (
														<Cell
															key={item.key}
															fill={CHART_COLORS[index % CHART_COLORS.length]}
														/>
													))}
												</Pie>
												<Tooltip content={<DashboardTooltip />} />
											</PieChart>
										</ResponsiveContainer>
									</div>

									<div className="space-y-2">
										{importanceData.map((item, index) => (
											<div
												key={item.key}
												className="flex items-center justify-between text-sm text-[#425062]"
											>
												<div className="flex items-center gap-2">
													<span
														className="size-2.5 rounded-full"
														style={{
															backgroundColor:
																CHART_COLORS[index % CHART_COLORS.length],
														}}
													/>
													<span>{item.label}</span>
												</div>
												<strong className="text-[#1f2a38]">
													{formatCount(item.count)}
												</strong>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="rounded-2xl bg-[#f8f9fb] px-4 py-12 text-sm text-[#6c7683]">
									Nao ha distribuicao por importancia para este periodo.
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
						<CardHeader className="pb-4">
							<CardTitle className="text-[1.1rem] text-[#1f2a38]">
								Motivos de finalizacao
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{dashboard === undefined && dashboardQuery.isPending ? (
								<>
									<Skeleton className="h-20 rounded-2xl bg-[#edf1f5]" />
									<Skeleton className="h-20 rounded-2xl bg-[#edf1f5]" />
								</>
							) : finalizationData.length > 0 ? (
								finalizationData.map((item) => (
									<div
										key={item.key}
										className="rounded-2xl bg-[#f8f9fb] px-4 py-4"
									>
										<div className="flex items-center justify-between gap-3">
											<p className="text-sm font-medium text-[#1f2a38]">
												{item.label}
											</p>
											<span className="rounded-full bg-[#fff0e8] px-2.5 py-1 text-xs font-semibold text-[#ff7a45]">
												{formatCount(item.count)}
											</span>
										</div>
									</div>
								))
							) : (
								<div className="rounded-2xl bg-[#f8f9fb] px-4 py-12 text-sm text-[#6c7683]">
									As negociacoes encerradas ainda nao geraram motivos no
									intervalo aplicado.
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
						<CardHeader className="pb-4">
							<CardTitle className="text-[1.1rem] text-[#1f2a38]">
								Filtro em uso
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm text-[#425062]">
							<div className="flex items-center gap-3 rounded-2xl bg-[#f8f9fb] px-4 py-4">
								<CalendarRange className="size-4 text-[#ff7a45]" />
								<div>
									<p className="font-medium text-[#1f2a38]">
										{dashboard
											? getTimeModeLabel(dashboard.filter.mode)
											: getTimeModeLabel(appliedQuery.mode)}
									</p>
									<p className="text-xs text-[#7a8491]">
										{dashboard
											? `${dashboard.filter.startDate} a ${dashboard.filter.endDate}`
											: appliedQuery.mode === 'custom'
												? `${appliedQuery.startDate ?? '--'} a ${appliedQuery.endDate ?? '--'}`
												: `Referencia em ${appliedQuery.referenceDate ?? '--'}`}
									</p>
								</div>
							</div>

							<p className="leading-6 text-[#6c7683]">
								O backend valida o intervalo temporal e devolve os indicadores
								ja recortados pelo seu papel, entao a interface trabalha com
								dados reais e consistentes com o escopo permitido.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}

export { AnalyticDashboardPageContent };
