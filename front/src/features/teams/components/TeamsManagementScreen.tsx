'use client';

import { useQueries } from '@tanstack/react-query';
import {
	ChartNoAxesColumnIncreasing,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Filter,
	Plus,
	Search,
	Target,
	Trophy,
	UsersRound,
} from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchLeadCatalog } from '@/features/leads/api/leads.service';
import { useLeadOwnersQuery } from '@/features/leads/hooks/leads.catalog.queries';
import type {
	LeadOwnerRecord,
	LeadStore,
} from '@/features/leads/model/leads.model';
import { useStoresQuery } from '@/features/stores/hooks/stores.queries';
import {
	useAssignTeamManagerMutation,
	useCreateTeamMutation,
	useDeleteTeamMutation,
	useUpdateTeamMutation,
} from '@/features/teams/hooks/teams.mutations';
import { useTeamsQuery } from '@/features/teams/hooks/teams.queries';
import type { TeamRecord } from '@/features/teams/model/teams.model';
import { showCrudSuccessToast } from '@/lib/feedback/crud-success-toast';
import {
	humanizeFormApiError,
	humanizePageApiError,
} from '@/lib/http/humanize-api-error';

import {
	emptyTeamForm,
	TeamDeleteDialog,
	TeamFormDialog,
	toTeamPayload,
	type TeamDialogState,
	type TeamFormState,
} from './TeamForm';
import { TeamsTable, type TeamTableRow } from './TeamsTable';

type MetricTone = 'blue' | 'green' | 'orange' | 'purple';
type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

const TEAMS_PAGE_SIZE = 6;
const TEAM_COLORS = [
	'text-[#f4511e]',
	'text-[#7f35e8]',
	'text-[#2563eb]',
	'text-[#f79009]',
	'text-[#079455]',
	'text-[#0ba5ec]',
] as const;
const DISTRIBUTION_COLORS = [
	'#f4511e',
	'#ff9b85',
	'#a855f7',
	'#5b8def',
	'#f7b731',
] as const;

function normalizeSearch(value: string) {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();
}

function getInitials(value: string, fallback: string) {
	const initials = value
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	return initials || fallback;
}

function formatCount(value: number) {
	return Math.round(value).toLocaleString('pt-BR');
}

function getConversionRate(convertedCount: number, totalCount: number) {
	if (totalCount <= 0) {
		return 0;
	}
	return Math.round((convertedCount / totalCount) * 100);
}

function buildPaginationItems(
	currentPage: number,
	totalPages: number,
): PaginationItem[] {
	if (totalPages <= 5) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	if (currentPage <= 4) {
		return [1, 2, 3, 4, 'ellipsis-end', totalPages];
	}

	if (currentPage >= totalPages - 2) {
		return [
			1,
			'ellipsis-start',
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		];
	}

	return [
		1,
		'ellipsis-start',
		currentPage - 1,
		currentPage,
		currentPage + 1,
		'ellipsis-end',
		totalPages,
	];
}

async function fetchTeamMetrics(
	teamId: string,
	storeId: string,
	signal: AbortSignal,
) {
	const [catalog, negotiatingCatalog] = await Promise.all([
		fetchLeadCatalog({ limit: 1, page: 1, sort: 'recent', storeId }, signal),
		fetchLeadCatalog(
			{
				limit: 1,
				page: 1,
				sort: 'recent',
				status: 'NEGOTIATING',
				storeId,
			},
			signal,
		),
	]);

	return {
		conversionRate: catalog.summary.conversionRate,
		convertedCount: catalog.summary.converted,
		openDealsCount: Math.max(
			catalog.funnel.openDeals,
			negotiatingCatalog.total,
		),
		teamId,
		total: catalog.total,
	};
}

function getMetricToneClass(tone: MetricTone) {
	switch (tone) {
		case 'blue':
			return 'bg-[#eff6ff] text-[#2563eb]';
		case 'green':
			return 'bg-[#ecfdf3] text-[#079455]';
		case 'orange':
			return 'bg-[#fff3ee] text-[#f4511e]';
		case 'purple':
			return 'bg-[#f4edff] text-[#7f35e8]';
	}
}

function TeamMetricCard({
	helper,
	icon: Icon,
	label,
	tone,
	value,
}: {
	helper: string;
	icon: typeof UsersRound;
	label: string;
	tone: MetricTone;
	value: string;
}) {
	return (
		<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="flex min-h-28 items-center gap-4 p-5">
				<div
					className={`flex size-12 shrink-0 items-center justify-center rounded-full ${getMetricToneClass(tone)}`}
				>
					<Icon className="size-5" />
				</div>
				<div className="space-y-1">
					<p className="text-xs font-medium text-[#667085]">{label}</p>
					<p className="text-2xl font-bold tracking-tight text-[#101828]">
						{value}
					</p>
					<p className="text-xs text-[#667085]">{helper}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function getOwnerById(owners: LeadOwnerRecord[]) {
	return new Map(owners.map((owner) => [owner.id, owner]));
}

function getStoreById(stores: LeadStore[]) {
	return new Map(stores.map((store) => [store.id, store]));
}

function TeamsDistributionCard({ rows }: { rows: TeamTableRow[] }) {
	const distributionRows = [...rows].reduce<
		Map<
			string,
			{
				memberCount: number;
				storeName: string;
				teamCount: number;
			}
		>
	>((distribution, row) => {
		const current = distribution.get(row.storeName) ?? {
			memberCount: 0,
			storeName: row.storeName,
			teamCount: 0,
		};
		current.memberCount += row.memberCount;
		current.teamCount += 1;
		distribution.set(row.storeName, current);
		return distribution;
	}, new Map());
	const rankedRows = [...distributionRows.values()]
		.sort(
			(left, right) =>
				right.memberCount - left.memberCount ||
				left.storeName.localeCompare(right.storeName, 'pt-BR'),
		)
		.slice(0, 5);
	const membersTotal = [...distributionRows.values()].reduce(
		(total, row) => total + row.memberCount,
		0,
	);
	const maxMembers = Math.max(1, ...rankedRows.map((row) => row.memberCount));

	return (
		<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="space-y-5 p-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-base font-bold text-[#101828]">
							Distribuição por loja
						</h2>
						<p className="text-xs text-[#667085]">Top 5 por membros ativos</p>
					</div>
					<div className="text-right">
						<p className="text-lg font-bold text-[#101828]">
							{formatCount(membersTotal)}
						</p>
						<p className="text-[11px] text-[#667085]">membros</p>
					</div>
				</div>

				<div className="space-y-4">
					{rankedRows.map((row, index) => {
						const percentage = membersTotal
							? Math.round((row.memberCount / membersTotal) * 100)
							: 0;
						const width = Math.max(
							8,
							Math.round((row.memberCount / maxMembers) * 100),
						);
						return (
							<div className="space-y-2" key={row.storeName}>
								<div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
									<div className="min-w-0">
										<p className="truncate text-sm font-bold text-[#101828]">
											{row.storeName}
										</p>
										<p className="text-xs text-[#667085]">
											{formatCount(row.memberCount)} membros · {row.teamCount}{' '}
											{row.teamCount === 1 ? 'equipe' : 'equipes'}
										</p>
									</div>
									<p className="text-sm font-bold text-[#101828]">
										{percentage}%
									</p>
								</div>
								<div className="h-2.5 overflow-hidden rounded-full bg-[#eef2f6]">
									<div
										className="h-full rounded-full"
										style={{
											backgroundColor:
												DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
											width: `${width}%`,
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

function LeadershipHighlightsCard({ rows }: { rows: TeamTableRow[] }) {
	const rankedRows = [...rows]
		.filter((row) => row.team.managerId)
		.sort(
			(left, right) =>
				right.conversionRate - left.conversionRate ||
				(right.leadCount ?? 0) - (left.leadCount ?? 0) ||
				left.managerName.localeCompare(right.managerName, 'pt-BR'),
		)
		.slice(0, 5);

	return (
		<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
			<CardContent className="flex h-full flex-col gap-5 p-5">
				<div>
					<h2 className="text-base font-bold text-[#101828]">
						Lideranças em destaque
					</h2>
					<p className="text-xs text-[#667085]">Ranking por performance</p>
				</div>
				<div className="flex flex-1 flex-col justify-between gap-4">
					{rankedRows.map((row, index) => (
						<div
							className="grid min-h-13 grid-cols-[28px_36px_minmax(0,1fr)_44px] items-center gap-3"
							key={`${row.team.id}-${row.managerName}`}
						>
							<span
								className={`flex size-6 items-center justify-center rounded-lg text-xs font-bold ${
									index === 0
										? 'bg-[#f4511e] text-white'
										: index === 1
											? 'bg-[#f4edff] text-[#7f35e8]'
											: 'bg-[#eff6ff] text-[#2563eb]'
								}`}
							>
								{index + 1}
							</span>
							<div className="flex size-9 items-center justify-center rounded-full bg-[#eef2f6] text-xs font-bold text-[#667085]">
								{row.managerInitials}
							</div>
							<div className="min-w-0">
								<p className="truncate text-xs font-bold text-[#101828]">
									{row.managerName}
								</p>
								<p className="truncate text-[11px] text-[#667085]">
									{row.team.name}
								</p>
							</div>
							<p className="text-right text-sm font-bold text-[#101828]">
								{row.conversionRate}%
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function TeamsManagementScreen() {
	const storesQuery = useStoresQuery();
	const teamsQuery = useTeamsQuery();
	const ownersQuery = useLeadOwnersQuery();

	const createTeamMutation = useCreateTeamMutation();
	const assignTeamManagerMutation = useAssignTeamManagerMutation();
	const updateTeamMutation = useUpdateTeamMutation();
	const deleteTeamMutation = useDeleteTeamMutation();

	const [teamDialogState, setTeamDialogState] =
		useState<TeamDialogState | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<TeamRecord | null>(null);
	const [teamFormState, setTeamFormState] =
		useState<TeamFormState>(emptyTeamForm);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [storeFilter, setStoreFilter] = useState('ALL');
	const [page, setPage] = useState(1);
	const isHydrated = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);
	const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);
	const owners = useMemo(() => ownersQuery.data ?? [], [ownersQuery.data]);
	const ownerById = useMemo(() => getOwnerById(owners), [owners]);
	const storeById = useMemo(() => getStoreById(stores), [stores]);

	const leadCountQueries = useQueries({
		queries: teams.map((team) => ({
			enabled: teams.length > 0,
			queryFn: ({ signal }: { signal: AbortSignal }) =>
				fetchTeamMetrics(team.id, team.storeId, signal),
			queryKey: ['teams', 'metrics', team.id],
		})),
	});

	const metricsByTeamId = useMemo(() => {
		const metricsByTeam = new Map<
			string,
			{
				conversionRate: number;
				convertedCount: number;
				openDealsCount: number;
				total: number;
			}
		>();
		for (const query of leadCountQueries) {
			if (query.data) {
				metricsByTeam.set(query.data.teamId, {
					conversionRate: query.data.conversionRate,
					convertedCount: query.data.convertedCount,
					openDealsCount: query.data.openDealsCount,
					total: query.data.total,
				});
			}
		}
		return metricsByTeam;
	}, [leadCountQueries]);

	const rows = useMemo<TeamTableRow[]>(
		() =>
			teams.map((team) => {
				const manager = team.managerId ? ownerById.get(team.managerId) : null;
				const store = storeById.get(team.storeId);
				const metrics = metricsByTeamId.get(team.id);
				const teamIndex = teams.findIndex((item) => item.id === team.id);
				return {
					colorClass: TEAM_COLORS[teamIndex % TEAM_COLORS.length],
					conversionRate: metrics?.conversionRate ?? 0,
					initials: getInitials(team.name, 'EQ'),
					leadCount: metrics?.total ?? null,
					managerEmail: manager?.email ?? null,
					managerInitials: getInitials(manager?.name ?? '', 'GG'),
					managerName: manager?.name ?? 'Sem gerente',
					memberCount: team.memberUserIds.length,
					openDealsCount: metrics?.openDealsCount ?? null,
					storeName: store?.name ?? 'Loja vinculada',
					team,
				};
			}),
		[metricsByTeamId, ownerById, storeById, teams],
	);

	const filteredRows = useMemo(() => {
		const searchTerm = normalizeSearch(search);
		return rows.filter((row) => {
			const matchesSearch =
				!searchTerm ||
				normalizeSearch(
					`${row.team.name} ${row.storeName} ${row.managerName} ${row.managerEmail ?? ''}`,
				).includes(searchTerm);
			const matchesStore =
				storeFilter === 'ALL' || row.team.storeId === storeFilter;
			return matchesSearch && matchesStore;
		});
	}, [rows, search, storeFilter]);

	const totalPages = Math.max(
		1,
		Math.ceil(filteredRows.length / TEAMS_PAGE_SIZE),
	);
	const safePage = Math.min(page, totalPages);
	const paginationItems = buildPaginationItems(safePage, totalPages);
	const paginatedRows = filteredRows.slice(
		(safePage - 1) * TEAMS_PAGE_SIZE,
		safePage * TEAMS_PAGE_SIZE,
	);
	const totalMembers = rows.reduce((total, row) => total + row.memberCount, 0);
	const totalAssignedLeads = rows.reduce(
		(total, row) => total + (row.leadCount ?? 0),
		0,
	);
	const totalOpenDeals = rows.reduce(
		(total, row) => total + (row.openDealsCount ?? 0),
		0,
	);
	const totalConvertedLeads = rows.reduce((total, row) => {
		const leadCount = row.leadCount ?? 0;
		return total + Math.round((leadCount * row.conversionRate) / 100);
	}, 0);
	const averageConversionRate = getConversionRate(
		totalConvertedLeads,
		totalAssignedLeads,
	);
	const isLoading =
		teamsQuery.isLoading || ownersQuery.isLoading || storesQuery.isLoading;
	const errorMessage = teamsQuery.isError
		? humanizePageApiError(teamsQuery.error)
		: ownersQuery.isError
			? humanizePageApiError(ownersQuery.error)
			: storesQuery.isError
				? humanizePageApiError(storesQuery.error)
				: null;

	function openCreateTeamDialog() {
		setDialogError(null);
		setTeamFormState({
			...emptyTeamForm,
			storeId: stores[0]?.id ?? '',
		});
		setTeamDialogState({ mode: 'create', team: null });
	}

	function openEditTeamDialog(team: TeamRecord) {
		setDialogError(null);
		setTeamFormState({
			name: team.name,
			storeId: team.storeId,
			managerId: team.managerId ?? '',
		});
		setTeamDialogState({ mode: 'edit', team });
	}

	async function handleTeamSubmit() {
		const payload = toTeamPayload(teamFormState);
		if (!payload) {
			setDialogError('Informe nome e loja da equipe.');
			return;
		}

		setDialogError(null);
		try {
			if (teamDialogState?.mode === 'edit' && teamDialogState.team) {
				await updateTeamMutation.mutateAsync({
					id: teamDialogState.team.id,
					body: {
						name: payload.name,
						storeId: payload.storeId,
					},
				});
				const nextManagerId = payload.managerId;
				if (nextManagerId !== (teamDialogState.team.managerId ?? null)) {
					await assignTeamManagerMutation.mutateAsync({
						id: teamDialogState.team.id,
						managerId: nextManagerId,
					});
				}
				showCrudSuccessToast('team', 'updated');
			} else {
				await createTeamMutation.mutateAsync({
					name: payload.name,
					storeId: payload.storeId,
					managerId: payload.managerId,
				});
				showCrudSuccessToast('team', 'created');
			}

			setTeamDialogState(null);
			setTeamFormState(emptyTeamForm);
		} catch (error) {
			setDialogError(humanizeFormApiError(error));
		}
	}

	async function handleDeleteConfirm() {
		if (!deleteTarget) {
			return;
		}

		setDeleteError(null);
		try {
			await deleteTeamMutation.mutateAsync(deleteTarget.id);
			showCrudSuccessToast('team', 'deleted');
			setDeleteTarget(null);
		} catch (error) {
			setDeleteError(humanizeFormApiError(error));
		}
	}

	return (
		<div className="space-y-5">
			<header className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight text-[#101828]">
						Equipes
					</h1>
					<p className="max-w-4xl text-sm text-[#667085]">
						Organize as equipes por loja, gerencie líderes e acompanhe a
						operação comercial do time.
					</p>
				</div>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
					<div className="relative">
						<Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#667085]" />
						<Input
							className="h-11 rounded-xl border-[#d8e0ea] bg-white pr-4 pl-10 text-xs shadow-none lg:w-[340px]"
							onChange={(event) => {
								setSearch(event.target.value);
								setPage(1);
							}}
							placeholder="Buscar por equipe, loja ou gerente..."
							value={search}
						/>
					</div>
					<div className="relative">
						<Filter className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#1f2a44]" />
						<select
							className="h-11 appearance-none rounded-xl border border-[#d8e0ea] bg-white pr-8 pl-10 text-xs font-semibold text-[#1f2a44] outline-none"
							onChange={(event) => {
								setStoreFilter(event.target.value);
								setPage(1);
							}}
							value={storeFilter}
						>
							<option value="ALL">Filtros</option>
							{stores.map((store) => (
								<option key={store.id} value={store.id}>
									{store.name}
								</option>
							))}
						</select>
					</div>
					<Button
						className="h-11 rounded-xl bg-[#f4511e] px-5 text-sm text-white shadow-sm hover:bg-[#dc3f13]"
						disabled={!isHydrated || stores.length === 0}
						onClick={openCreateTeamDialog}
					>
						<Plus className="size-4" />
						Nova equipe
					</Button>
				</div>
			</header>

			<div className="grid gap-4 xl:grid-cols-5">
				<TeamMetricCard
					helper="Equipes cadastradas"
					icon={UsersRound}
					label="Total de equipes"
					tone="orange"
					value={formatCount(teams.length)}
				/>
				<TeamMetricCard
					helper="Somatório dos membros"
					icon={CheckCircle2}
					label="Membros ativos"
					tone="green"
					value={formatCount(totalMembers)}
				/>
				<TeamMetricCard
					helper="Distribuídos por equipe"
					icon={Target}
					label="Leads atribuídos"
					tone="purple"
					value={formatCount(totalAssignedLeads)}
				/>
				<TeamMetricCard
					helper="Status em negociação"
					icon={ChartNoAxesColumnIncreasing}
					label="Negociações abertas"
					tone="blue"
					value={formatCount(totalOpenDeals)}
				/>
				<TeamMetricCard
					helper="Leads convertidos"
					icon={Trophy}
					label="Conversão média"
					tone="orange"
					value={`${averageConversionRate}%`}
				/>
			</div>

			<Card className="rounded-2xl border-[#dfe7f1] bg-white shadow-sm">
				<CardContent className="space-y-5 p-5">
					<div className="space-y-5">
						{isLoading ? (
							<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
								Carregando equipes...
							</div>
						) : errorMessage ? (
							<div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
								{errorMessage}
							</div>
						) : (
							<TeamsTable
								onDelete={(team) => {
									setDeleteError(null);
									setDeleteTarget(team);
								}}
								onEdit={openEditTeamDialog}
								rows={paginatedRows}
							/>
						)}

						<div className="grid items-center gap-3 text-xs text-[#667085] md:grid-cols-[1fr_auto_1fr]">
							<span>
								Mostrando{' '}
								{paginatedRows.length === 0
									? 0
									: (safePage - 1) * TEAMS_PAGE_SIZE + 1}{' '}
								a {Math.min(safePage * TEAMS_PAGE_SIZE, filteredRows.length)} de{' '}
								{filteredRows.length} equipes
							</span>
							<div className="flex items-center justify-center gap-2">
								<Button
									className="size-8 rounded-xl border-[#d8e0ea]"
									disabled={!isHydrated || safePage <= 1}
									onClick={() => setPage((current) => Math.max(1, current - 1))}
									size="icon"
									variant="outline"
								>
									<ChevronLeft className="size-3.5" />
								</Button>
								{paginationItems.map((item) =>
									typeof item === 'string' ? (
										<span
											className="px-1 text-xs font-semibold text-[#667085]"
											key={item}
										>
											...
										</span>
									) : (
										<Button
											className={
												item === safePage
													? 'size-8 rounded-xl border border-[#ffb199] bg-[#fff3ee] text-xs font-semibold text-[#f4511e] shadow-none hover:bg-[#fff3ee]'
													: 'size-8 rounded-xl text-xs font-semibold text-[#1f2a44] shadow-none hover:bg-[#f8fafc]'
											}
											key={item}
											onClick={() => setPage(item)}
											size="icon"
											variant={item === safePage ? 'outline' : 'ghost'}
										>
											{item}
										</Button>
									),
								)}
								<Button
									className="size-8 rounded-xl border-[#d8e0ea]"
									disabled={!isHydrated || safePage >= totalPages}
									onClick={() =>
										setPage((current) => Math.min(totalPages, current + 1))
									}
									size="icon"
									variant="outline"
								>
									<ChevronRight className="size-3.5" />
								</Button>
							</div>
							<span className="text-right">
								Itens por página: {TEAMS_PAGE_SIZE}
							</span>
						</div>

						<div className="grid gap-5 xl:grid-cols-2">
							<TeamsDistributionCard rows={rows} />
							<LeadershipHighlightsCard rows={rows} />
						</div>
					</div>
				</CardContent>
			</Card>

			<TeamFormDialog
				dialogError={dialogError}
				dialogState={teamDialogState}
				formState={teamFormState}
				isPending={
					createTeamMutation.isPending ||
					updateTeamMutation.isPending ||
					assignTeamManagerMutation.isPending
				}
				onClose={() => {
					setTeamDialogState(null);
					setDialogError(null);
				}}
				onSave={() => {
					void handleTeamSubmit();
				}}
				onStateChange={setTeamFormState}
				owners={owners}
				stores={stores}
			/>

			<TeamDeleteDialog
				deleteError={deleteError}
				isPending={deleteTeamMutation.isPending}
				onClose={() => {
					setDeleteTarget(null);
					setDeleteError(null);
				}}
				onConfirm={() => {
					void handleDeleteConfirm();
				}}
				target={deleteTarget}
			/>
		</div>
	);
}

export { TeamsManagementScreen };
