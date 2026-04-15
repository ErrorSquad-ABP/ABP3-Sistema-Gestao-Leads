'use client';

import {
	ChevronLeft,
	ChevronRight,
	LayoutList,
	Plus,
	Search,
	UserRound,
	Building2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError, isApiError } from '@/lib/http/api-error';
import {
	useLeadCustomersQuery,
	useLeadOwnersQuery,
	useLeadStoresQuery,
} from '../hooks/leads.catalog.queries';
import { useLeadsListQuery } from '../hooks/leads.queries';
import {
	useConvertLeadMutation,
	useCreateLeadMutation,
	useDeleteLeadMutation,
	useReassignLeadMutation,
	useUpdateLeadMutation,
} from '../hooks/leads.mutations';
import {
	formatLeadSourceLabel,
	formatLeadStatusLabel,
	leadSourceOptions,
	leadStatusOptions,
} from '../lib/lead-list-labels';
import { LEADS_PAGE_LIMIT } from '../lib/leads-pagination';
import type {
	CreateLeadInput,
	LeadCustomer,
	LeadListItem,
	ReassignLeadInput,
	UpdateLeadInput,
} from '../types/leads.types';
import {
	buildOwnerOptions,
	getLeadsErrorMessage,
	LeadConfirmDialog,
	LeadFormDialog,
	LeadReassignDialog,
} from './LeadForm';
import {
	CustomerManagerDialog,
	LeadsTableSkeleton,
	StoreManagerDialog,
} from './LeadDetails';
import { LeadsTable } from './LeadsTable';

type LeadsPageContentProps = {
	user: AuthenticatedUser;
};

function normalizeSearchValue(value: string) {
	return value.trim().toLowerCase();
}

function buildCustomerLabelById(customers: LeadCustomer[]) {
	const entries = customers.map(
		(customer) => [customer.id, customer.name] as const,
	);
	return Object.fromEntries(entries);
}

function LeadsPageContent({ user }: LeadsPageContentProps) {
	const [listPage, setListPage] = useState(1);
	const query = useLeadsListQuery(user, listPage);
	const customersQuery = useLeadCustomersQuery();
	const storesQuery = useLeadStoresQuery();
	const ownersQuery = useLeadOwnersQuery();
	const createLeadMutation = useCreateLeadMutation();
	const updateLeadMutation = useUpdateLeadMutation();
	const reassignLeadMutation = useReassignLeadMutation();
	const convertLeadMutation = useConvertLeadMutation();
	const deleteLeadMutation = useDeleteLeadMutation();
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'ALL' | LeadListItem['status']
	>('ALL');
	const [sourceFilter, setSourceFilter] = useState<
		'ALL' | LeadListItem['source']
	>('ALL');
	const [leadFormMode, setLeadFormMode] = useState<'create' | 'edit'>('create');
	const [leadFormOpen, setLeadFormOpen] = useState(false);
	const [customerManagerOpen, setCustomerManagerOpen] = useState(false);
	const [storeManagerOpen, setStoreManagerOpen] = useState(false);
	const [reassignOpen, setReassignOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [convertOpen, setConvertOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [targetLead, setTargetLead] = useState<LeadListItem | null>(null);
	const { scope, data, isPending, isError, isSuccess, error, totalPages } =
		query;
	const leads = useMemo(() => data ?? [], [data]);

	const title = user.role === 'ATTENDANT' ? 'Meus leads' : 'Gestão de leads';
	let subtitle =
		'Centralize entrada, reatribuição e evolução dos leads do seu escopo.';
	if (user.role === 'ATTENDANT') {
		subtitle =
			'Acompanhe os leads sob sua responsabilidade e atualize o fluxo comercial.';
	} else if (scope?.kind === 'all') {
		subtitle =
			user.role === 'GENERAL_MANAGER'
				? 'Vista global de leads para acompanhamento executivo do pipeline.'
				: 'Visão administrativa completa para governança operacional dos leads.';
	}

	const customers = useMemo(
		() => customersQuery.data ?? [],
		[customersQuery.data],
	);
	const stores = useMemo(() => storesQuery.data ?? [], [storesQuery.data]);
	const owners = useMemo(() => ownersQuery.data ?? [], [ownersQuery.data]);
	const catalogError =
		customersQuery.error ?? storesQuery.error ?? ownersQuery.error ?? null;
	const catalogsPending =
		customersQuery.isPending || storesQuery.isPending || ownersQuery.isPending;
	const catalogsReady =
		customersQuery.isSuccess && storesQuery.isSuccess && ownersQuery.isSuccess;
	const customerLabelById = useMemo(
		() => buildCustomerLabelById(customers),
		[customers],
	);
	const storeLabelById = useMemo(
		() => Object.fromEntries(stores.map((store) => [store.id, store.name])),
		[stores],
	);
	const ownerLabelById = useMemo(
		() =>
			Object.fromEntries(
				owners.map((owner) => [owner.id, `${owner.name} · ${owner.email}`]),
			),
		[owners],
	);
	const normalizedSearch = normalizeSearchValue(search);
	const filteredLeads = useMemo(
		() =>
			leads.filter((lead) => {
				if (statusFilter !== 'ALL' && lead.status !== statusFilter) {
					return false;
				}
				if (sourceFilter !== 'ALL' && lead.source !== sourceFilter) {
					return false;
				}
				if (!normalizedSearch) {
					return true;
				}

				const haystack = [
					lead.id,
					customerLabelById[lead.customerId] ?? lead.customerId,
					storeLabelById[lead.storeId] ?? lead.storeId,
					lead.ownerUserId
						? (ownerLabelById[lead.ownerUserId] ?? lead.ownerUserId)
						: 'sem responsável',
					formatLeadSourceLabel(lead.source),
					formatLeadStatusLabel(lead.status),
				]
					.join(' ')
					.toLowerCase();

				return haystack.includes(normalizedSearch);
			}),
		[
			customerLabelById,
			leads,
			normalizedSearch,
			ownerLabelById,
			sourceFilter,
			statusFilter,
			storeLabelById,
		],
	);

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
			setDialogError(getLeadsErrorMessage(nextError));
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
			setDialogError(getLeadsErrorMessage(nextError));
		}
	}

	const currentOwnerLabel = targetLead?.ownerUserId
		? (ownerLabelById[targetLead.ownerUserId] ?? 'Responsável definido')
		: 'Sem responsável';

	return (
		<div className="space-y-6" aria-busy={isPending ? 'true' : 'false'}>
			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-3">
							<div className="flex size-12 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<LayoutList className="size-5" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
									Workspace
								</p>
								<CardTitle className="text-[1.9rem] font-semibold tracking-tight">
									{title}
								</CardTitle>
								<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
									{subtitle}
								</p>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0" />
			</Card>

			{scope === null ? (
				<div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
					Esta área não está disponível para o seu perfil.
				</div>
			) : null}

			{scope?.kind === 'none' ? (
				<div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
					Sem equipas com visibilidade para listagem ou criação de leads.
					Contacte um administrador se precisar de apoio.
				</div>
			) : null}

			{scope !== null && scope.kind !== 'none' ? (
				<>
					{isError ? (
						<div
							className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
							role="alert"
							aria-live="polite"
						>
							{error instanceof ApiError
								? error.message
								: 'Não foi possível carregar os leads.'}
						</div>
					) : null}
					{isPending ? <LeadsTableSkeleton /> : null}
					{isSuccess ? (
						<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
							<CardHeader className="gap-5 border-none pb-6">
								<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
									<div className="space-y-2">
										<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
											Operação comercial
										</p>
										<CardTitle className="text-[1.45rem] font-semibold tracking-tight">
											Lista operacional de leads
										</CardTitle>
										<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
											Crie, atualize, reatribua e converta leads dentro do seu
											escopo de atuação.
										</p>
									</div>
									<CardAction className="static self-start">
										<div className="flex flex-wrap gap-2">
											<Button
												className="rounded-md shadow-none bg-[#2D3648] hover:bg-[#232B3B]"
												onClick={openCreateDialog}
												type="button"
											>
												<Plus className="size-4" />
												Novo lead
											</Button>
											<Button
												className="rounded-md shadow-none"
												onClick={() => setCustomerManagerOpen(true)}
												type="button"
												variant="outline"
											>
												<UserRound className="size-4" />
												Clientes
											</Button>
											<Button
												className="rounded-md shadow-none"
												onClick={() => setStoreManagerOpen(true)}
												type="button"
												variant="outline"
											>
												<Building2 className="size-4" />
												Lojas
											</Button>
										</div>
									</CardAction>
								</div>
							</CardHeader>
							<CardContent className="space-y-5 pt-0">
								{catalogError ? (
									<div
										className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
										role="alert"
									>
										{isApiError(catalogError)
											? catalogError.message
											: 'Não foi possível carregar os catálogos necessários para a tabela de leads.'}
									</div>
								) : null}
								{catalogsPending ? (
									<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
										Carregando clientes, lojas e responsáveis para montar a
										lista operacional...
									</div>
								) : null}
								<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
									<div className="relative w-full lg:max-w-md">
										<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
										<Input
											className="h-10 rounded-md border-[#d6dce5] bg-[#f8fafc] pl-9 shadow-none focus-visible:border-[#2d3648]/45"
											onChange={(event) => {
												setSearch(event.target.value);
												setListPage(1);
											}}
											placeholder="Pesquisar por lead, cliente, loja ou responsável"
											value={search}
										/>
									</div>
									<div className="flex flex-col gap-3 sm:flex-row">
										<select
											className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
											onChange={(event) => {
												setStatusFilter(
													event.target.value as 'ALL' | LeadListItem['status'],
												);
												setListPage(1);
											}}
											value={statusFilter}
										>
											<option value="ALL">Todos os estados</option>
											{leadStatusOptions.map((status) => (
												<option key={status.value} value={status.value}>
													{status.label}
												</option>
											))}
										</select>
										<select
											className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
											onChange={(event) => {
												setSourceFilter(
													event.target.value as 'ALL' | LeadListItem['source'],
												);
												setListPage(1);
											}}
											value={sourceFilter}
										>
											<option value="ALL">Todas as origens</option>
											{leadSourceOptions.map((source) => (
												<option key={source.value} value={source.value}>
													{source.label}
												</option>
											))}
										</select>
									</div>
								</div>

								{catalogsReady ? (
									<LeadsTable
										customerLabelById={customerLabelById}
										leads={filteredLeads}
										onConvert={openConvertDialog}
										onDelete={
											user.role === 'ADMINISTRATOR'
												? openDeleteDialog
												: undefined
										}
										onEdit={openEditDialog}
										onReassign={
											user.role === 'ATTENDANT' ? undefined : openReassignDialog
										}
										ownerLabelById={ownerLabelById}
										storeLabelById={storeLabelById}
									/>
								) : null}

								{catalogsReady ? (
									<div className="flex flex-col gap-3 border-t border-border/75 pt-4 sm:flex-row sm:items-center sm:justify-between">
										<p className="text-sm text-[#6b7687]">
											Até {LEADS_PAGE_LIMIT} leads por página
											{query.total > 0 ? ` · ${query.total} no total` : null}
										</p>
										<div className="flex items-center gap-2">
											<p className="mr-2 text-sm text-[#6b7687]">
												Página {listPage} de {Math.max(totalPages, 1)}
											</p>
											<Button
												className="rounded-md"
												disabled={listPage <= 1 || isPending}
												onClick={() => setListPage((p) => p - 1)}
												size="icon-sm"
												type="button"
												variant="outline"
											>
												<ChevronLeft className="size-4" />
											</Button>
											<Button
												className="rounded-md"
												disabled={
													listPage >= Math.max(totalPages, 1) || isPending
												}
												onClick={() => setListPage((p) => p + 1)}
												size="icon-sm"
												type="button"
												variant="outline"
											>
												<ChevronRight className="size-4" />
											</Button>
										</div>
									</div>
								) : null}
							</CardContent>
						</Card>
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
		</div>
	);
}

export { LeadsPageContent };
