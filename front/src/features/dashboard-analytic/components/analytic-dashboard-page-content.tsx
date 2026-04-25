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
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	Rectangle,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError } from '@/lib/http/api-error';

import { useAnalyticDashboardQuery } from '../hooks/analytic-dashboard.queries';
import type {
	AnalyticDashboardFilterMode,
	AnalyticDashboardQuery,
} from '../model/analytic-dashboard.model';

const ANALYTIC_FILTER_OPTIONS: {
	value: AnalyticDashboardFilterMode;
	label: string;
}[] = [
	{ value: 'week', label: 'Semana' },
	{ value: 'month', label: 'Mês' },
	{ value: 'year', label: 'Ano' },
	{ value: 'custom', label: 'Período' },
];

const IMPORTANCE_COLORS = ['#ff7a45', '#f39c12', '#3498db', '#2d3648'];
const PERFORMANCE_BAR_COLOR = '#ff7a45';
const SECONDARY_BAR_COLOR = '#2d3648';
const MUTED_LINE_COLOR = '#cfd8e3';

function todayIso() {
	return new Date().toISOString().slice(0, 10);
}

function thirtyDaysAgoIso() {
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

function getScopeLabel(scope: string) {
	switch (scope) {
		case 'attendant':
			return 'Somente seus leads';
		case 'manager':
			return 'Equipe e loja do gestor';
		case 'general_manager':
			return 'Lojas visíveis ao gerente geral';
		case 'full':
			return 'Visão global';
		default:
			return scope;
	}
}

function getRoleCopy(user: AuthenticatedUser) {
	switch (user.role) {
		case 'MANAGER':
			return {
				eyebrow: 'Gestão da equipe',
				title: 'Dashboard analítico comercial',
				subtitle:
					'Acompanhe conversão, desempenho do time e sinais de perda dentro do seu escopo gerencial.',
			};
		case 'GENERAL_MANAGER':
			return {
				eyebrow: 'Visão consolidada',
				title: 'Dashboard analítico multiunidade',
				subtitle:
					'Compare conversão, distribuição de esforço e qualidade do atendimento entre as lojas sob sua responsabilidade.',
			};
		case 'ADMINISTRATOR':
			return {
				eyebrow: 'Administração',
				title: 'Dashboard analítico global',
				subtitle:
					'Leia o funil comercial completo com filtros temporais, rankings operacionais e indicadores de encerramento.',
			};
		default:
			return {
				eyebrow: 'Análise',
				title: 'Dashboard analítico',
				subtitle:
					'Indicadores consolidados do funil comercial com o recorte permitido para o seu perfil.',
			};
	}
}

type PerformanceTooltipProps = TooltipProps<number, string>;

function PerformanceTooltip({
	active,
	payload,
	label,
}: PerformanceTooltipProps) {
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

type AnalyticDashboardPageContentProps = {
	user: AuthenticatedUser;
};

function AnalyticDashboardPageContent({
	user,
}: AnalyticDashboardPageContentProps) {
	const initialReferenceDate = todayIso();
	const [draftMode, setDraftMode] =
		useState<AnalyticDashboardFilterMode>('month');
	const [draftReferenceDate, setDraftReferenceDate] =
		useState(initialReferenceDate);
	const [draftStartDate, setDraftStartDate] = useState(thirtyDaysAgoIso());
	const [draftEndDate, setDraftEndDate] = useState(initialReferenceDate);
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
	const conversionTrendData = useMemo(() => {
		if (!dashboard) {
			return [];
		}
		return [
			{
				name: 'Convertidos',
				valor: dashboard.summary.convertedLeads,
				fill: PERFORMANCE_BAR_COLOR,
			},
			{
				name: 'Não convertidos',
				valor: dashboard.summary.notConvertedLeads,
				fill: SECONDARY_BAR_COLOR,
			},
		];
	}, [dashboard]);

	const performanceRadarData = useMemo(
		() =>
			topTeams.map((team) => ({
				team: team.name,
				conversao: Number(team.conversionRate.toFixed(1)),
				ganhas: team.wonDeals,
			})),
		[topTeams],
	);

	function applyFilter() {
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

	return (
		<div
			className="space-y-6"
			aria-busy={dashboardQuery.isPending ? 'true' : 'false'}
		>
			<section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1f2a38_0%,#17212c_100%)] px-6 py-6 text-white shadow-[0_16px_40px_rgba(23,33,44,0.12)] md:px-8">
				<div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
					<div className="max-w-3xl space-y-3">
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb192]">
							{copy.eyebrow}
						</p>
						<div className="space-y-2">
							<h1 className="text-[2rem] font-semibold leading-tight tracking-tight md:text-[2.3rem]">
								{copy.title}
							</h1>
							<p className="max-w-2xl text-sm leading-7 text-[#cfd8e3] md:text-[0.95rem]">
								{copy.subtitle}
							</p>
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
									onClick={() => setDraftMode(option.value)}
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
											onChange={(event) => setDraftStartDate(event.target.value)}
											type="date"
											value={draftStartDate}
										/>
									</label>
									<label className="space-y-2 text-sm">
										<span className="text-[#d9e1eb]">Data final</span>
										<Input
											className="h-11 rounded-md border-white/10 bg-white text-[#1f2a38]"
											onChange={(event) => setDraftEndDate(event.target.value)}
											type="date"
											value={draftEndDate}
										/>
									</label>
								</>
							) : (
								<label className="space-y-2 text-sm md:col-span-2">
									<span className="text-[#d9e1eb]">Data de referência</span>
									<Input
										className="h-11 rounded-md border-white/10 bg-white text-[#1f2a38]"
										onChange={(event) =>
											setDraftReferenceDate(event.target.value)
										}
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
						</div>
					</div>
				</div>
			</section>

			{dashboardQuery.isError ? (
				<div
					className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{dashboardQuery.error instanceof ApiError
						? dashboardQuery.error.message
						: 'Não foi possível carregar o dashboard analítico.'}
				</div>
			) : null}

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{[
					{
						icon: TrendingUp,
						iconClasses: 'bg-[#fff0e8] text-[#ff7a45]',
						label: 'Taxa de conversão',
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
						label: 'Leads não convertidos',
						value: dashboard
							? formatCount(dashboard.summary.notConvertedLeads)
							: '--',
					},
					{
						icon: Clock3,
						iconClasses: 'bg-[#f4eefc] text-[#8e5dd9]',
						label: 'Tempo médio até atendimento',
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
				))}
			</section>

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
							{dashboardQuery.isPending ? (
								<div className="rounded-2xl bg-[#f8f9fb] px-4 py-14 text-sm text-[#6c7683]">
									Carregando indicadores do dashboard...
								</div>
							) : topAttendants.length === 0 ? (
								<div className="rounded-2xl bg-[#f8f9fb] px-4 py-14 text-sm text-[#6c7683]">
									Não há dados de atendentes para o período selecionado.
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
												<Tooltip content={<PerformanceTooltip />} />
												<Legend />
												<Bar
													dataKey="convertedLeads"
													fill={PERFORMANCE_BAR_COLOR}
													name="Convertidos"
													radius={[8, 8, 0, 0]}
												/>
												<Bar
													dataKey="notConvertedLeads"
													fill={SECONDARY_BAR_COLOR}
													name="Não convertidos"
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
								{topTeams.length === 0 ? (
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
												<Tooltip content={<PerformanceTooltip />} />
												<Line
													dataKey="convertedLeads"
													name="Convertidos"
													stroke={PERFORMANCE_BAR_COLOR}
													strokeWidth={3}
													type="monotone"
													dot={{ fill: PERFORMANCE_BAR_COLOR, r: 4 }}
												/>
												<Line
													dataKey="notConvertedLeads"
													name="Não convertidos"
													stroke={MUTED_LINE_COLOR}
													strokeWidth={3}
													type="monotone"
													dot={{ fill: SECONDARY_BAR_COLOR, r: 4 }}
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
										Leitura gerencial
									</p>
									<CardTitle className="text-[1.25rem] text-[#1f2a38]">
										Intensidade por equipe
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								{performanceRadarData.length === 0 ? (
									<div className="rounded-2xl bg-[#f8f9fb] px-4 py-12 text-sm text-[#6c7683]">
										Não há dados suficientes para montar o radar.
									</div>
								) : (
									<div className="h-[280px] w-full">
										<ResponsiveContainer width="100%" height="100%">
											<RadarChart cx="50%" cy="50%" data={performanceRadarData}>
												<PolarGrid stroke="#e9edf2" />
												<PolarAngleAxis
													dataKey="team"
													tick={{ fill: '#7a8491', fontSize: 11 }}
												/>
												<PolarRadiusAxis
													axisLine={false}
													tick={false}
													tickCount={4}
												/>
												<Radar
													dataKey="conversao"
													fill="rgba(255,122,69,0.26)"
													fillOpacity={1}
													name="Conversão %"
													stroke={PERFORMANCE_BAR_COLOR}
													strokeWidth={2}
												/>
												<Tooltip />
											</RadarChart>
										</ResponsiveContainer>
									</div>
								)}
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
									Período aplicado
								</p>
								<p className="mt-2 text-sm font-medium text-[#1f2a38]">
									{dashboard
										? `${formatDateLabel(dashboard.filter.startDate)} até ${formatDateLabel(
												dashboard.filter.endDate,
											)}`
										: '--'}
								</p>
							</div>
							<div className="space-y-3 text-sm text-[#425062]">
								<div className="flex items-center justify-between">
									<span>Total de leads</span>
									<strong className="text-[#1f2a38]">
										{dashboard ? formatCount(dashboard.summary.totalLeads) : '--'}
									</strong>
								</div>
								<div className="flex items-center justify-between">
									<span>Escopo de visualização</span>
									<strong className="text-[#1f2a38]">
										{dashboard ? getScopeLabel(dashboard.filter.scope) : '--'}
									</strong>
								</div>
								<div className="flex items-center justify-between">
									<span>Leads com interação</span>
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
							<div className="h-[220px] w-full">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={conversionTrendData}
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
										<Tooltip content={<PerformanceTooltip />} />
										<Bar
											dataKey="valor"
											radius={[0, 8, 8, 0]}
											shape={<Rectangle radius={[0, 8, 8, 0]} />}
										>
											{conversionTrendData.map((item) => (
												<Cell key={item.name} fill={item.fill} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
						<CardHeader className="pb-4">
							<CardTitle className="text-[1.1rem] text-[#1f2a38]">
								Negociações por importância
							</CardTitle>
						</CardHeader>
						<CardContent>
							{dashboard?.importanceDistribution.length ? (
								<div className="space-y-5">
									<div className="h-[220px] w-full">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													cx="50%"
													cy="50%"
													data={dashboard.importanceDistribution}
													dataKey="count"
													innerRadius={56}
													nameKey="label"
													outerRadius={86}
													paddingAngle={3}
												>
													{dashboard.importanceDistribution.map((item, index) => (
														<Cell
															key={item.key}
															fill={
																IMPORTANCE_COLORS[
																	index % IMPORTANCE_COLORS.length
																]
															}
														/>
													))}
												</Pie>
												<Tooltip content={<PerformanceTooltip />} />
											</PieChart>
										</ResponsiveContainer>
									</div>
									<div className="space-y-2">
										{dashboard.importanceDistribution.map((item, index) => (
											<div
												key={item.key}
												className="flex items-center justify-between text-sm text-[#425062]"
											>
												<div className="flex items-center gap-2">
													<span
														className="size-2.5 rounded-full"
														style={{
															backgroundColor:
																IMPORTANCE_COLORS[
																	index % IMPORTANCE_COLORS.length
																],
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
									Não há distribuição por importância para este período.
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-3xl border-[#e6eaef] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
						<CardHeader className="pb-4">
							<CardTitle className="text-[1.1rem] text-[#1f2a38]">
								Motivos de finalização
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{dashboard?.finalizationReasons.length ? (
								dashboard.finalizationReasons.map((item) => (
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
									As negociações encerradas ainda não geraram motivos no intervalo aplicado.
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
											? ANALYTIC_FILTER_OPTIONS.find(
													(option) => option.value === dashboard.filter.mode,
												)?.label ?? dashboard.filter.mode
											: 'Modo'}
									</p>
									<p className="text-xs text-[#7a8491]">
										{dashboard
											? `${dashboard.filter.startDate} a ${dashboard.filter.endDate}`
											: 'Sem período aplicado'}
									</p>
								</div>
							</div>
							<p className="leading-6 text-[#6c7683]">
								O backend valida o intervalo temporal e devolve os indicadores já
								recortados pelo seu papel, então a tela trabalha só com números
								prontos para leitura.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}

export { AnalyticDashboardPageContent };
