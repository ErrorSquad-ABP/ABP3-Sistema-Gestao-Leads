'use client';

import {
	BarChart3,
	Building2,
	ChevronRight,
	Clock3,
	LayoutDashboard,
	Search,
	Shield,
	Target,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { startTransition, useDeferredValue, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { useAnalyticsDashboard } from '../hooks/analytics-dashboard.queries';
import type {
	AnalyticDashboardScreenProps,
	AnalyticsDashboardFilter,
	AnalyticsPerformanceItem,
	AnalyticsPeriodMode,
} from '../types/analytics-dashboard.types';

const periodOptions: Array<{ value: AnalyticsPeriodMode; label: string }> = [
	{ value: 'week', label: 'Semana' },
	{ value: 'month', label: 'Mês' },
	{ value: 'year', label: 'Ano' },
	{ value: 'custom', label: 'Período customizado' },
];

const demoActivities = [
	'Revisar taxa de conversão por equipe ao longo do período.',
	'Comparar atendentes com maior volume e maior eficiência.',
	'Validar se o intervalo aplicado está dentro da regra do seu papel.',
];
const teamColumnSlots = ['slot-a', 'slot-b', 'slot-c', 'slot-d'] as const;

function formatPercent(value: number) {
	return `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`;
}

function formatDateLabel(value: string) {
	return new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	}).format(new Date(`${value}T00:00:00`));
}

function formatRoleLabel(
	role: AnalyticDashboardScreenProps['currentUser']['role'],
) {
	switch (role) {
		case 'ADMINISTRATOR':
			return 'Administrador';
		case 'GENERAL_MANAGER':
			return 'Gerente Geral';
		case 'MANAGER':
			return 'Gerente';
		case 'ATTENDANT':
			return 'Atendente';
	}
}

function resolveHeatVariant(conversionRate: number) {
	if (conversionRate >= 50) {
		return {
			label: 'Quente',
			className: 'bg-[#ffe5dc] text-[#ff7a45]',
		};
	}

	if (conversionRate >= 20) {
		return {
			label: 'Morna',
			className: 'bg-[#fff4e0] text-[#d88912]',
		};
	}

	return {
		label: 'Fria',
		className: 'bg-[#e8f0ff] text-[#3b7edb]',
	};
}

function resolveFilterSummary(filter: AnalyticsDashboardFilter) {
	if (filter.period === 'custom') {
		return `${formatDateLabel(filter.startDate)} até ${formatDateLabel(filter.endDate)}`;
	}

	return `${filter.period === 'week' ? 'Semana' : filter.period === 'month' ? 'Mês' : 'Ano'} de ${formatDateLabel(filter.referenceDate)}`;
}

function matchesSearch(item: AnalyticsPerformanceItem, searchTerm: string) {
	if (searchTerm.length === 0) {
		return true;
	}

	const haystack = `${item.entityName} ${item.teamName ?? ''}`.toLowerCase();
	return haystack.includes(searchTerm.toLowerCase());
}

function resolveColumnData(
	items: AnalyticsPerformanceItem[],
	columnIndex: number,
) {
	return items.slice(0, 4)[columnIndex] ?? null;
}

function AnalyticDashboardScreen({
	currentUser,
	initialFilter,
}: AnalyticDashboardScreenProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [appliedFilter, setAppliedFilter] =
		useState<AnalyticsDashboardFilter>(initialFilter);
	const [draftPeriod, setDraftPeriod] = useState<AnalyticsPeriodMode>(
		initialFilter.period,
	);
	const [draftReferenceDate, setDraftReferenceDate] = useState(
		initialFilter.period === 'custom'
			? new Date().toISOString().slice(0, 10)
			: initialFilter.referenceDate,
	);
	const [draftStartDate, setDraftStartDate] = useState(
		initialFilter.period === 'custom'
			? initialFilter.startDate
			: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
					.toISOString()
					.slice(0, 10),
	);
	const [draftEndDate, setDraftEndDate] = useState(
		initialFilter.period === 'custom'
			? initialFilter.endDate
			: new Date().toISOString().slice(0, 10),
	);
	const deferredSearchTerm = useDeferredValue(searchTerm);

	const dashboardQuery = useAnalyticsDashboard(appliedFilter);
	const dashboard = dashboardQuery.data;

	const visibleTeams = (dashboard?.byTeam ?? []).filter((item) =>
		matchesSearch(item, deferredSearchTerm),
	);
	const visibleAttendants = (dashboard?.byAttendant ?? []).filter((item) =>
		matchesSearch(item, deferredSearchTerm),
	);

	function applyFilter() {
		startTransition(() => {
			if (draftPeriod === 'custom') {
				setAppliedFilter({
					period: 'custom',
					startDate: draftStartDate,
					endDate: draftEndDate,
				});
				return;
			}

			setAppliedFilter({
				period: draftPeriod,
				referenceDate: draftReferenceDate,
			});
		});
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,122,69,0.16),_transparent_32%),linear-gradient(180deg,#f5f6f8_0%,#eef1f5_100%)] text-[#333]">
			<div className="mx-auto flex min-h-screen max-w-[1700px] flex-col lg:flex-row">
				<aside className="flex w-full flex-col justify-between bg-[linear-gradient(180deg,#1f2a38,#17212c)] px-6 py-6 text-[#cfd8e3] lg:min-h-screen lg:w-[270px]">
					<div className="space-y-8">
						<div>
							<div className="text-[1.35rem] font-bold tracking-[0.04em] text-white">
								Quantum CRM
							</div>
							<p className="mt-2 text-sm text-[#9fb0c4]">
								Painel analítico com visão temporal do funil comercial.
							</p>
						</div>

						<nav className="space-y-6">
							<div className="space-y-2">
								<Link
									className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/5"
									href={appRoutes.app.dashboard.operational}
								>
									<LayoutDashboard className="size-4" />
									Dashboard operacional
								</Link>
								<Link
									className="flex items-center gap-3 rounded-xl bg-[#ff7a45] px-3 py-2 text-sm font-semibold text-white"
									href={appRoutes.app.dashboard.analytic}
								>
									<BarChart3 className="size-4" />
									Dashboard analítico
								</Link>
							</div>

							<div className="space-y-2">
								<div className="px-3 text-[0.7rem] uppercase tracking-[0.22em] text-[#7f8ea1]">
									Workspace
								</div>
								<Link
									className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/5"
									href={appRoutes.app.leads}
								>
									<Target className="size-4" />
									Leads
								</Link>
								<Link
									className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/5"
									href={appRoutes.app.users}
								>
									<Users className="size-4" />
									Usuários
								</Link>
							</div>
						</nav>
					</div>

					<div className="mt-8 rounded-2xl border border-white/8 bg-white/5 p-4">
						<div className="text-sm font-semibold text-white">
							{currentUser.name}
						</div>
						<div className="mt-1 text-xs text-[#9fb0c4]">
							{formatRoleLabel(currentUser.role)}
						</div>
					</div>
				</aside>

				<main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
					<div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
						<div>
							<div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#7f8a98]">
								<span>Dashboard</span>
								<ChevronRight className="size-3" />
								<span>Analítico</span>
							</div>
							<h1 className="text-3xl font-semibold tracking-tight text-[#1d2633]">
								Negociações e conversão
							</h1>
							<p className="mt-2 max-w-3xl text-sm leading-6 text-[#667487]">
								A interface segue a direção visual do mock e já consome o
								endpoint analítico do backend com filtros por semana, mês, ano e
								período customizado.
							</p>
						</div>

						<div className="flex flex-col gap-3 self-stretch xl:min-w-[440px] xl:max-w-[540px]">
							<div className="relative">
								<Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8391a2]" />
								<Input
									className="h-12 rounded-full border-[#d8dde6] bg-white pl-11 pr-4 shadow-none"
									onChange={(event) => setSearchTerm(event.target.value)}
									placeholder="Buscar por atendente ou equipe..."
									value={searchTerm}
								/>
							</div>

							<div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
								<select
									className="h-12 rounded-2xl border border-[#d8dde6] bg-white px-4 text-sm text-[#243041] outline-none"
									onChange={(event) =>
										setDraftPeriod(event.target.value as AnalyticsPeriodMode)
									}
									value={draftPeriod}
								>
									{periodOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>

								{draftPeriod === 'custom' ? (
									<>
										<Input
											className="h-12 rounded-2xl border-[#d8dde6] bg-white"
											onChange={(event) =>
												setDraftStartDate(event.target.value)
											}
											type="date"
											value={draftStartDate}
										/>
										<Input
											className="h-12 rounded-2xl border-[#d8dde6] bg-white"
											onChange={(event) => setDraftEndDate(event.target.value)}
											type="date"
											value={draftEndDate}
										/>
									</>
								) : (
									<Input
										className="h-12 rounded-2xl border-[#d8dde6] bg-white md:col-span-2"
										onChange={(event) =>
											setDraftReferenceDate(event.target.value)
										}
										type="date"
										value={draftReferenceDate}
									/>
								)}

								<Button
									className="h-12 rounded-2xl bg-[#ff7a45] px-5 text-white hover:bg-[#ec6d39]"
									onClick={applyFilter}
								>
									Aplicar filtro
								</Button>
							</div>
						</div>
					</div>

					<div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						<Card className="border-none bg-white p-5 shadow-[0_12px_50px_-30px_rgba(0,0,0,0.25)]">
							<div className="text-sm text-[#7a818c]">Leads no período</div>
							<div className="mt-2 text-3xl font-semibold text-[#202734]">
								{dashboard?.summary.totalLeads ?? '--'}
							</div>
							<div className="mt-3 text-xs text-[#2ecc71]">
								{dashboard
									? resolveFilterSummary(appliedFilter)
									: 'Aguardando carregamento'}
							</div>
						</Card>

						<Card className="border-none bg-white p-5 shadow-[0_12px_50px_-30px_rgba(0,0,0,0.25)]">
							<div className="text-sm text-[#7a818c]">Leads convertidos</div>
							<div className="mt-2 text-3xl font-semibold text-[#202734]">
								{dashboard?.summary.convertedLeads ?? '--'}
							</div>
							<div className="mt-3 text-xs text-[#2ecc71]">
								{dashboard
									? `${dashboard.convertedVsNonConverted.nonConverted} não convertidos`
									: 'Sem dados ainda'}
							</div>
						</Card>

						<Card className="border-none bg-white p-5 shadow-[0_12px_50px_-30px_rgba(0,0,0,0.25)]">
							<div className="text-sm text-[#7a818c]">Taxa de conversão</div>
							<div className="mt-2 text-3xl font-semibold text-[#202734]">
								{dashboard
									? formatPercent(dashboard.summary.conversionRate)
									: '--'}
							</div>
							<div className="mt-3 text-xs text-[#7a818c]">
								Comparativo real entre convertidos e não convertidos
							</div>
						</Card>

						<Card className="border-none bg-white p-5 shadow-[0_12px_50px_-30px_rgba(0,0,0,0.25)]">
							<div className="text-sm text-[#7a818c]">
								Tempo médio até a 1ª negociação
							</div>
							<div className="mt-2 text-3xl font-semibold text-[#202734]">
								{dashboard?.summary.averageTimeToFirstDealHours !== null &&
								dashboard?.summary.averageTimeToFirstDealHours !== undefined
									? `${dashboard.summary.averageTimeToFirstDealHours}h`
									: '--'}
							</div>
							<div className="mt-3 text-xs text-[#7a818c]">
								Baseado no primeiro deal registrado por lead
							</div>
						</Card>
					</div>

					<div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
						<section className="rounded-[1.1rem] bg-white p-4 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)] sm:p-5">
							<div className="mb-4 flex items-center justify-between">
								<div>
									<h2 className="text-lg font-semibold text-[#202734]">
										Funil analítico por equipe
									</h2>
									<p className="mt-1 text-sm text-[#748194]">
										Cada coluna destaca a equipe e seus atendentes com melhor
										volume no recorte atual.
									</p>
								</div>

								<div className="rounded-full bg-[#f4f6fb] px-4 py-2 text-xs font-medium text-[#5f6c7d]">
									Escopo: {formatRoleLabel(currentUser.role)}
								</div>
							</div>

							{dashboardQuery.isError ? (
								<div className="rounded-3xl border border-[#f1d7cc] bg-[#fff6f2] p-6 text-sm text-[#8a4b39]">
									<div className="font-semibold">
										Não foi possível carregar o dashboard.
									</div>
									<div className="mt-2 leading-6">
										{dashboardQuery.error instanceof Error
											? dashboardQuery.error.message
											: 'O backend retornou um erro inesperado.'}
									</div>
								</div>
							) : (
								<div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
									{teamColumnSlots.map((slot, columnIndex) => {
										const team = resolveColumnData(visibleTeams, columnIndex);
										const teamAttendants = team
											? visibleAttendants
													.filter((item) => item.teamId === team.teamId)
													.slice(0, 3)
											: [];

										return (
											<div
												className="rounded-2xl bg-[#f8f9fb] p-4"
												key={team?.entityId ?? slot}
											>
												<div className="mb-4 flex items-center justify-between gap-3">
													<div>
														<div className="text-sm font-semibold text-[#202734]">
															{team?.entityName ?? 'Sem dados'}
														</div>
														<div className="mt-1 text-xs text-[#7b8694]">
															{team
																? `${team.totalLeads} leads • ${formatPercent(
																		team.conversionRate,
																	)}`
																: 'Nenhuma equipe encontrada'}
														</div>
													</div>
													<Building2 className="size-4 text-[#8fa0b4]" />
												</div>

												{teamAttendants.length > 0 ? (
													teamAttendants.map((attendant) => {
														const heat = resolveHeatVariant(
															attendant.conversionRate,
														);

														return (
															<div
																className="mb-3 rounded-2xl bg-white p-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.25)] last:mb-0"
																key={attendant.entityId ?? attendant.entityName}
															>
																<div className="text-sm font-semibold text-[#202734]">
																	{attendant.entityName}
																</div>
																<div
																	className={cn(
																		'mt-2 inline-flex rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em]',
																		heat.className,
																	)}
																>
																	{heat.label}
																</div>
																<div className="mt-3 flex items-end justify-between gap-3 text-sm text-[#606d7b]">
																	<div>
																		{attendant.convertedLeads} convertidos
																	</div>
																	<div className="text-right font-semibold text-[#202734]">
																		{formatPercent(attendant.conversionRate)}
																	</div>
																</div>
															</div>
														);
													})
												) : (
													<div className="rounded-2xl border border-dashed border-[#d7dde6] bg-white/60 p-4 text-sm text-[#7b8694]">
														{dashboardQuery.isLoading
															? 'Carregando dados da equipe...'
															: 'Nenhum atendente disponível nesse recorte.'}
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</section>

						<aside className="flex flex-col gap-4">
							<Card className="border-none bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)]">
								<h3 className="text-sm font-semibold text-[#202734]">
									Resumo do funil
								</h3>
								<div className="mt-4 space-y-3 text-sm text-[#5e6b79]">
									{visibleTeams.slice(0, 4).map((team) => (
										<div
											className="flex items-center justify-between gap-3"
											key={team.entityId ?? team.entityName}
										>
											<span>{team.entityName}</span>
											<span className="font-semibold text-[#202734]">
												{team.totalLeads} leads
											</span>
										</div>
									))}
									{visibleTeams.length === 0 && (
										<div className="text-[#7b8694]">
											{dashboardQuery.isLoading
												? 'Carregando distribuição por equipe...'
												: 'Sem equipes para o filtro aplicado.'}
										</div>
									)}
								</div>
							</Card>

							<Card className="border-none bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)]">
								<h3 className="text-sm font-semibold text-[#202734]">
									{dashboard?.byImportance.length
										? 'Negociações por importância'
										: 'Destaques por atendente'}
								</h3>
								<div className="mt-4 space-y-3 text-sm text-[#5e6b79]">
									{dashboard?.byImportance.length
										? dashboard.byImportance.map((item) => (
												<div
													className="flex items-center justify-between gap-3"
													key={item.key}
												>
													<span>{item.label}</span>
													<span className="font-semibold text-[#202734]">
														{item.totalLeads} leads
													</span>
												</div>
											))
										: visibleAttendants.slice(0, 4).map((item) => (
												<div
													className="flex items-center justify-between gap-3"
													key={item.entityId ?? item.entityName}
												>
													<span>{item.entityName}</span>
													<span className="font-semibold text-[#202734]">
														{formatPercent(item.conversionRate)}
													</span>
												</div>
											))}

									{!dashboardQuery.isLoading &&
										!dashboard?.byImportance.length &&
										visibleAttendants.length === 0 && (
											<div className="text-[#7b8694]">
												Os dados de importância ainda não estão disponíveis no
												backend atual.
											</div>
										)}
								</div>
							</Card>

							<Card className="border-none bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)]">
								<h3 className="text-sm font-semibold text-[#202734]">
									Atividades importantes
								</h3>
								<div className="mt-4 space-y-3 text-sm text-[#5e6b79]">
									<div className="flex items-start gap-3 rounded-2xl bg-[#f8f9fb] p-3">
										<Clock3 className="mt-0.5 size-4 text-[#ff7a45]" />
										<div>
											<div className="font-medium text-[#202734]">
												Período aplicado
											</div>
											<div className="mt-1 leading-6">
												{dashboard
													? `${formatDateLabel(
															dashboard.period.startDate,
														)} até ${formatDateLabel(dashboard.period.endDate)}`
													: resolveFilterSummary(appliedFilter)}
											</div>
										</div>
									</div>

									{demoActivities.map((activity) => (
										<div
											className="rounded-2xl border border-[#edf0f4] p-3 leading-6"
											key={activity}
										>
											{activity}
										</div>
									))}

									<div className="rounded-2xl bg-[#17212c] p-4 text-[#dbe4ee]">
										<div className="flex items-center gap-2 text-sm font-semibold text-white">
											<Shield className="size-4" />
											Escopo protegido no backend
										</div>
										<div className="mt-2 text-sm leading-6 text-[#a6b4c4]">
											Os números desta tela já respeitam o recorte hierárquico
											do seu papel.
										</div>
									</div>
								</div>
							</Card>
						</aside>
					</div>
				</main>
			</div>
		</div>
	);
}

export { AnalyticDashboardScreen };
