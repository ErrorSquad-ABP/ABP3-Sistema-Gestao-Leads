'use client';

import { CalendarDays, Plus, Search, Target, Trophy, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { KpiCard } from '@/components/metrics/KpiCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LeadDealsDialog } from '@/features/deals/components/LeadDealsDialog';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { isApiError } from '@/lib/http/api-error';
import {
	humanizeFormApiError,
	humanizePageApiError,
} from '@/lib/http/humanize-api-error';
import {
	useLeadCustomersQuery,
	useLeadOwnersQuery,
	useLeadStoresQuery,
} from '../hooks/leads.catalog.queries';
import {
	useConvertLeadMutation,
	useCreateLeadMutation,
	useDeleteLeadMutation,
	useReassignLeadMutation,
	useUpdateLeadMutation,
} from '../hooks/leads.mutations';
import { useLeadCatalogQuery } from '../hooks/leads.queries';
import { leadSourceOptions, leadStatusOptions } from '../lib/lead-list-labels';
import type {
	CreateLeadInput,
	LeadCatalogItem,
	LeadListItem,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../model/leads.model';
import { LeadDetailSummaryDialog } from './LeadDetailSummaryDialog';
import {
	CustomerManagerDialog,
	LeadsTableSkeleton,
	StoreManagerDialog,
} from './LeadDetails';

import {
	buildOwnerOptions,
	LeadConfirmDialog,
	LeadFormDialog,
	LeadReassignDialog,
} from './LeadForm';
import {
	formatCount,
	LeadsListCard,
	type pageSizeOptions,
} from './LeadsCatalogWidgets';

type LeadsPageContentProps = {
	user: AuthenticatedUser;
};

const sortOptions = [
	{ value: 'recent', label: 'Mais recentes' },
	{ value: 'last_activity', label: 'Última atividade' },
	{ value: 'status', label: 'Status' },
	{ value: 'source', label: 'Origem' },
] as const;

function LeadsPageContent({ user }: LeadsPageContentProps) {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] =
		useState<(typeof pageSizeOptions)[number]>(10);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('WORKABLE');
	const [sourceFilter, setSourceFilter] = useState('');
	const [storeFilter, setStoreFilter] = useState('');
	const [ownerFilter, setOwnerFilter] = useState('');
	const [sort, setSort] =
		useState<(typeof sortOptions)[number]['value']>('recent');
	const [leadFormMode, setLeadFormMode] = useState<'create' | 'edit'>('create');
	const [leadFormOpen, setLeadFormOpen] = useState(false);
	const [customerManagerOpen, setCustomerManagerOpen] = useState(false);
	const [storeManagerOpen, setStoreManagerOpen] = useState(false);
	const [reassignOpen, setReassignOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [convertOpen, setConvertOpen] = useState(false);
	const [dealsOpen, setDealsOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [targetLead, setTargetLead] = useState<LeadListItem | null>(null);
	const [detailLeadItem, setDetailLeadItem] = useState<LeadCatalogItem | null>(
		null,
	);
	const [detailDialogOpen, setDetailDialogOpen] = useState(false);

	const catalogQuery = useLeadCatalogQuery(user, {
		search,
		status: statusFilter || undefined,
		source: sourceFilter || undefined,
		storeId: storeFilter || undefined,
		ownerUserId: ownerFilter || undefined,
		sort,
		page,
		limit: pageSize,
	});
	const customersQuery = useLeadCustomersQuery();
	const storesQuery = useLeadStoresQuery();
	const ownersQuery = useLeadOwnersQuery();
	const createLeadMutation = useCreateLeadMutation();
	const updateLeadMutation = useUpdateLeadMutation();
	const reassignLeadMutation = useReassignLeadMutation();
	const convertLeadMutation = useConvertLeadMutation();
	const deleteLeadMutation = useDeleteLeadMutation();

	const catalog = catalogQuery.data;
	const scope = catalogQuery.scope;
	const customers = useMemo(
		() => customersQuery.data ?? [],
		[customersQuery.data],
	);
	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);
	const owners = useMemo(() => ownersQuery.data ?? [], [ownersQuery.data]);
	const catalogError =
		customersQuery.error ?? storesQuery.error ?? ownersQuery.error ?? null;
	const currentOwnerLabel = targetLead?.ownerUserId
		? (owners.find((owner) => owner.id === targetLead.ownerUserId)?.name ??
			'Responsável definido')
		: 'Sem responsável';

	const metricCards = [
		{
			title: 'Leads com interação',
			value: formatCount(catalog?.summary.withInteraction ?? 0),
			description: 'Com atividade registrada',
			icon: <Zap className="size-5" />,
			variant: 'brand' as const,
		},
		{
			title: 'Leads convertidos',
			value: formatCount(catalog?.summary.converted ?? 0),
			description: 'Com conversão no CRM',
			icon: <Target className="size-5" />,
			variant: 'success' as const,
		},
		{
			title: 'Leads em atenção',
			value: formatCount(catalog?.summary.staleNoContact ?? 0),
			description: 'Aguardando evolução',
			icon: <CalendarDays className="size-5" />,
			variant: 'danger-soft' as const,
		},
		{
			title: 'Taxa de conversão',
			value: `${catalog?.summary.conversionRate ?? 0}%`,
			description: 'Leads convertidos',
			icon: <Trophy className="size-5" />,
			variant: 'warning' as const,
		},
	] as const;

	function resetFilters() {
		setSearch('');
		setStatusFilter('WORKABLE');
		setSourceFilter('');
		setStoreFilter('');
		setOwnerFilter('');
		setSort('recent');
		setPage(1);
	}

	function openCreateDialog() {
		setDialogError(null);
		setTargetLead(null);
		setLeadFormMode('create');
		setLeadFormOpen(true);
	}

	function openEditDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setLeadFormMode('edit');
		setLeadFormOpen(true);
	}

	function openReassignDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setReassignOpen(true);
	}

	function openDeleteDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setDeleteOpen(true);
	}

	function openConvertDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setConvertOpen(true);
	}

	function openDealsDialog(lead: LeadListItem) {
		setDialogError(null);
		setTargetLead(lead);
		setDealsOpen(true);
	}

	function openLeadDetail(item: LeadCatalogItem) {
		setDetailLeadItem(item);
		setDetailDialogOpen(true);
	}

	async function handleLeadFormSubmit(
		values: CreateLeadInput | UpdateLeadInput,
	) {
		if (leadFormMode === 'create') {
			await createLeadMutation.mutateAsync(values as CreateLeadInput);
			return;
		}
		if (!targetLead) {
			return;
		}
		await updateLeadMutation.mutateAsync({
			leadId: targetLead.id,
			payload: values as UpdateLeadInput,
		});
	}

	async function handleReassignSubmit(values: ReassignLeadInput) {
		if (!targetLead) {
			return;
		}
		await reassignLeadMutation.mutateAsync({
			leadId: targetLead.id,
			payload: values,
		});
	}

	async function handleDeleteConfirm() {
		if (!targetLead) {
			return;
		}
		setDialogError(null);
		try {
			await deleteLeadMutation.mutateAsync(targetLead.id);
			setDeleteOpen(false);
			setTargetLead(null);
		} catch (nextError) {
			setDialogError(humanizeFormApiError(nextError));
		}
	}

	async function handleConvertConfirm() {
		if (!targetLead) {
			return;
		}
		setDialogError(null);
		try {
			await convertLeadMutation.mutateAsync(targetLead.id);
			setConvertOpen(false);
			setTargetLead(null);
		} catch (nextError) {
			setDialogError(humanizeFormApiError(nextError));
		}
	}

	return (
		<div
			className="space-y-5"
			aria-busy={catalogQuery.isPending ? 'true' : 'false'}
		>
			<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
						Gestão de leads
					</h1>
					<p className="mt-2 text-sm text-[#667085]">
						Centralize, acompanhe e converta leads em oportunidades reais de
						negócio.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<div className="relative min-w-88 flex-1">
						<Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#667085]" />
						<Input
							className="h-12 rounded-xl border-[#d8e0ea] bg-white pl-11 shadow-none focus-visible:border-[#f05a28]/45"
							onChange={(event) => {
								setSearch(event.target.value);
								setPage(1);
							}}
							placeholder="Buscar por nome, e-mail, telefone ou CPF"
							value={search}
						/>
					</div>
					<Button
						className="h-12 rounded-xl bg-[#f05a28] px-5 text-white shadow-none hover:bg-[#df4f1f]"
						onClick={openCreateDialog}
						type="button"
					>
						<Plus className="size-4" />
						Novo lead
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{metricCards.map((card) => {
					return (
						<KpiCard
							key={card.title}
							title={card.title}
							value={card.value}
							description={card.description}
							icon={card.icon}
							variant={card.variant}
						/>
					);
				})}
			</div>

			{scope === null ? (
				<div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
					Esta área não está disponível para o seu perfil.
				</div>
			) : null}

			{scope?.kind === 'none' ? (
				<div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
					Sem equipes com visibilidade para listagem ou criação de leads.
				</div>
			) : null}

			{scope !== null && scope.kind !== 'none' ? (
				<>
					<Card className="rounded-3xl border-[#dfe7f1] bg-white">
						<CardContent
							className="flex flex-wrap items-center gap-3 p-5 xl:flex-nowrap"
							id="lead-filters"
						>
							<select
								className="h-11 w-full rounded-xl border border-[#d8e0ea] bg-white px-4 text-sm text-[#101828] outline-none sm:w-[190px]"
								onChange={(event) => {
									setStatusFilter(event.target.value);
									setPage(1);
								}}
								value={statusFilter}
							>
								<option value="">Todos os status</option>
								<option value="WORKABLE">Trabalháveis</option>
								{leadStatusOptions.map((status) => (
									<option key={status.value} value={status.value}>
										{status.label}
									</option>
								))}
							</select>
							<select
								className="h-11 w-full rounded-xl border border-[#d8e0ea] bg-white px-4 text-sm text-[#101828] outline-none sm:w-[210px]"
								onChange={(event) => {
									setSourceFilter(event.target.value);
									setPage(1);
								}}
								value={sourceFilter}
							>
								<option value="">Todas as origens</option>
								{leadSourceOptions.map((source) => (
									<option key={source.value} value={source.value}>
										{source.label}
									</option>
								))}
							</select>
							<select
								className="h-11 w-full rounded-xl border border-[#d8e0ea] bg-white px-4 text-sm text-[#101828] outline-none sm:w-[180px]"
								onChange={(event) => {
									setStoreFilter(event.target.value);
									setPage(1);
								}}
								value={storeFilter}
							>
								<option value="">Todas as lojas</option>
								{stores.map((store) => (
									<option key={store.id} value={store.id}>
										{store.name}
									</option>
								))}
							</select>
							<select
								className="h-11 w-full rounded-xl border border-[#d8e0ea] bg-white px-4 text-sm text-[#101828] outline-none sm:w-[240px]"
								onChange={(event) => {
									setOwnerFilter(event.target.value);
									setPage(1);
								}}
								value={ownerFilter}
							>
								<option value="">Todos os responsáveis</option>
								{owners.map((owner) => (
									<option key={owner.id} value={owner.id}>
										{owner.name}
									</option>
								))}
							</select>
							<div className="ml-auto flex min-w-0 flex-wrap items-center gap-3">
								<span className="text-sm whitespace-nowrap text-[#667085]">
									Ordenar por
								</span>
								<select
									className="h-11 w-[190px] rounded-xl border border-[#d8e0ea] bg-white px-4 text-sm text-[#101828] outline-none"
									onChange={(event) => {
										setSort(event.target.value as typeof sort);
										setPage(1);
									}}
									value={sort}
								>
									{sortOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<Button
									className="h-11 px-3 whitespace-nowrap text-[#667085]"
									onClick={resetFilters}
									type="button"
									variant="ghost"
								>
									Limpar filtros
								</Button>
							</div>
						</CardContent>
					</Card>

					{catalogError ? (
						<div
							className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
							role="alert"
						>
							{isApiError(catalogError)
								? humanizePageApiError(catalogError)
								: 'Não foi possível carregar os catálogos necessários para a tela de leads.'}
						</div>
					) : null}

					{catalogQuery.isError ? (
						<div
							className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
							role="alert"
						>
							{humanizePageApiError(catalogQuery.error)}
						</div>
					) : null}

					{catalogQuery.isPending ? <LeadsTableSkeleton /> : null}

					{catalog ? (
						<LeadsListCard
							currentPage={catalog.page}
							items={catalog.items}
							onConvert={openConvertDialog}
							onDeals={openDealsDialog}
							onDelete={
								user.role === 'ADMINISTRATOR' ? openDeleteDialog : undefined
							}
							onDetail={openLeadDetail}
							onEdit={openEditDialog}
							onNextPage={() => setPage((value) => value + 1)}
							onPageChange={setPage}
							onPageSizeChange={(value) => {
								setPageSize(value);
								setPage(1);
							}}
							onPreviousPage={() => setPage((value) => value - 1)}
							onReassign={
								user.role === 'ATTENDANT' ? undefined : openReassignDialog
							}
							pageSize={pageSize}
							totalItems={catalog.total}
							totalPages={catalog.totalPages}
						/>
					) : null}
				</>
			) : null}

			<LeadFormDialog
				key={`lead-form-${leadFormMode}-${targetLead?.id ?? 'new'}`}
				customers={customers}
				isPending={
					leadFormMode === 'create'
						? createLeadMutation.isPending
						: updateLeadMutation.isPending
				}
				mode={leadFormMode}
				onClose={() => {
					setLeadFormOpen(false);
					setTargetLead(null);
				}}
				onSubmit={handleLeadFormSubmit}
				open={leadFormOpen}
				owners={owners}
				stores={stores}
				targetLead={targetLead}
				user={user}
			/>

			<CustomerManagerDialog
				customers={customers}
				onClose={() => setCustomerManagerOpen(false)}
				open={customerManagerOpen}
			/>

			<StoreManagerDialog
				onClose={() => setStoreManagerOpen(false)}
				open={storeManagerOpen}
				stores={stores}
				user={user}
			/>

			<LeadReassignDialog
				key={`lead-reassign-${targetLead?.id ?? 'none'}`}
				currentOwnerLabel={currentOwnerLabel}
				isPending={reassignLeadMutation.isPending}
				onClose={() => {
					setReassignOpen(false);
					setTargetLead(null);
				}}
				onSubmit={handleReassignSubmit}
				open={reassignOpen}
				ownerOptions={
					targetLead
						? buildOwnerOptions({
								leadOwners: owners,
								selectedStoreId: targetLead.storeId,
							})
						: []
				}
				targetLead={targetLead}
				user={user}
			/>

			<LeadConfirmDialog
				confirmLabel="Confirmar conversão"
				description={
					targetLead
						? 'O lead selecionado será marcado como convertido.'
						: 'Confirme a conversão do lead selecionado.'
				}
				error={dialogError}
				icon="convert"
				isPending={convertLeadMutation.isPending}
				onClose={() => {
					setConvertOpen(false);
					setTargetLead(null);
					setDialogError(null);
				}}
				onConfirm={handleConvertConfirm}
				open={convertOpen}
				title="Converter lead"
			/>

			<LeadConfirmDialog
				confirmLabel="Excluir lead"
				description={
					targetLead
						? 'O lead selecionado será removido permanentemente.'
						: 'Confirme a exclusão do lead selecionado.'
				}
				error={dialogError}
				icon="delete"
				isPending={deleteLeadMutation.isPending}
				onClose={() => {
					setDeleteOpen(false);
					setTargetLead(null);
					setDialogError(null);
				}}
				onConfirm={handleDeleteConfirm}
				open={deleteOpen}
				title="Excluir lead"
			/>

			<LeadDealsDialog
				leadId={targetLead?.id ?? null}
				leadStoreId={targetLead?.storeId ?? null}
				onClose={() => {
					setDealsOpen(false);
					setTargetLead(null);
					setDialogError(null);
				}}
				open={dealsOpen}
			/>

			<LeadDetailSummaryDialog
				leadItem={detailLeadItem}
				onClose={() => {
					setDetailDialogOpen(false);
					setDetailLeadItem(null);
				}}
				open={detailDialogOpen}
			/>
		</div>
	);
}

export { LeadsPageContent };
