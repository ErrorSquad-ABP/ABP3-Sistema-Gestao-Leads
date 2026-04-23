'use client';

import { ChevronLeft, ChevronRight, LayoutList, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError } from '@/lib/http/api-error';

import { useDealsListQuery } from '../hooks/deals.queries';
import {
	useDeleteDealMutation,
	useUpdateDealMutation,
} from '../hooks/deals.mutations';
import type { Deal, DealStatus, DealUpdateInput } from '../model/deals.model';
import { dealStatusOptions } from '../lib/deal-labels';
import { DealsTable } from './DealsTable';
import { DealConfirmDialog } from './DealConfirmDialog';
import { DealDetailsDialog } from './DealDetailsDialog';
import { DealFormDialog, getDealsErrorMessage } from './DealFormDialog';

const DEALS_DEFAULT_LIMIT = 20;

function normalizeSearchValue(value: string) {
	return value.trim().toLowerCase();
}

type DealsPageContentProps = {
	user: AuthenticatedUser;
};

function DealsPageContent({ user }: DealsPageContentProps) {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<'ALL' | DealStatus>('ALL');
	const [search, setSearch] = useState('');

	const query = useDealsListQuery({
		page,
		limit: DEALS_DEFAULT_LIMIT,
		status: statusFilter === 'ALL' ? undefined : (statusFilter as DealStatus),
	});

	const deleteDealMutation = useDeleteDealMutation();
	const updateDealMutation = useUpdateDealMutation();

	const [detailsOpen, setDetailsOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [targetDeal, setTargetDeal] = useState<Deal | null>(null);

	const paged = query.data;
	const deals = useMemo(() => paged?.items ?? [], [paged?.items]);
	const totalPages = paged?.totalPages ?? 0;

	const normalizedSearch = normalizeSearchValue(search);
	const filteredDeals = useMemo(() => {
		if (!normalizedSearch) {
			return deals;
		}
		return deals.filter((deal) => {
			const haystack = [
				deal.id,
				deal.title,
				deal.leadId,
				deal.vehicleId,
				deal.status,
				deal.stage,
				deal.importance,
				deal.value ?? '',
			]
				.join(' ')
				.toLowerCase();
			return haystack.includes(normalizedSearch);
		});
	}, [deals, normalizedSearch]);

	/** Alinha com a política do backend: só oferece editar/excluir quando há linhas com `canMutate` na vista atual. */
	const canMutateInView = useMemo(
		() => filteredDeals.some((d) => d.canMutate),
		[filteredDeals],
	);
	const canMutateOnPage = useMemo(
		() => deals.some((d) => d.canMutate),
		[deals],
	);

	function openDetails(deal: Deal) {
		setTargetDeal(deal);
		setDetailsOpen(true);
	}

	function openEdit(deal: Deal) {
		if (!deal.canMutate) {
			return;
		}
		setDialogError(null);
		setTargetDeal(deal);
		setEditOpen(true);
	}

	function openDelete(deal: Deal) {
		if (!deal.canMutate) {
			return;
		}
		setDialogError(null);
		setTargetDeal(deal);
		setDeleteOpen(true);
	}

	async function handleEditSubmit(values: DealUpdateInput) {
		if (!targetDeal) return;
		await updateDealMutation.mutateAsync({
			dealId: targetDeal.id,
			payload: values,
		});
	}

	async function handleDeleteConfirm() {
		if (!targetDeal) return;
		setDialogError(null);
		try {
			await deleteDealMutation.mutateAsync({
				dealId: targetDeal.id,
				leadId: targetDeal.leadId,
			});
			setDeleteOpen(false);
			setTargetDeal(null);
		} catch (error) {
			setDialogError(getDealsErrorMessage(error));
		}
	}

	const title =
		user.role === 'ATTENDANT' ? 'Minhas negociações' : 'Gestão de negociações';
	const subtitle =
		'Acompanhe status, etapa e importância das negociações dentro do seu escopo.';

	return (
		<div className="space-y-6" aria-busy={query.isPending ? 'true' : 'false'}>
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

			{query.isError ? (
				<div
					className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{query.error instanceof ApiError
						? query.error.message
						: 'Não foi possível carregar as negociações.'}
				</div>
			) : null}

			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-6">
					<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
						<div className="space-y-2">
							<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
								Operação comercial
							</p>
							<CardTitle className="text-[1.45rem] font-semibold tracking-tight">
								Lista de negociações
							</CardTitle>
							<p className="max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
								{query.isSuccess && deals.length > 0 && !canMutateOnPage
									? 'Apenas consulta: nesta página, o seu perfil não tem permissão para editar ou excluir nenhuma negociação (a alteração segue a mesma regra de quem pode alterar o respetivo lead). Pode abrir detalhes.'
									: query.isSuccess &&
											filteredDeals.length > 0 &&
											!canMutateInView &&
											canMutateOnPage
										? 'Nenhum dos resultados filtrados tem permissão de alteração. Ajuste a pesquisa; editar e excluir exigem poder alterar o lead, não só vê-lo na listagem.'
										: 'Abra detalhes. "Editar" e "Excluir" só aparecem no menu nas negociações em que tem permissão de alteração, na mesma linha da regra de mutação do respetivo lead.'}
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-5 pt-0">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
						<div className="relative w-full lg:max-w-md">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b7687]" />
							<Input
								className="h-10 rounded-md border-[#d6dce5] bg-[#f8fafc] pl-9 shadow-none focus-visible:border-[#2d3648]/45"
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Pesquisar por título, lead ou veículo"
								value={search}
							/>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row">
							<select
								className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
								onChange={(event) =>
									setStatusFilter(event.target.value as 'ALL' | DealStatus)
								}
								value={statusFilter}
							>
								<option value="ALL">Todos os status</option>
								{dealStatusOptions.map((status) => (
									<option key={status.value} value={status.value}>
										{status.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{query.isPending ? (
						<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
							Carregando negociações...
						</div>
					) : null}

					{query.isSuccess ? (
						<>
							<DealsTable
								deals={filteredDeals}
								onDelete={canMutateInView ? openDelete : undefined}
								onEdit={canMutateInView ? openEdit : undefined}
								onOpenDetails={openDetails}
							/>
							<div className="flex flex-col gap-3 border-t border-border/75 pt-4 sm:flex-row sm:items-center sm:justify-between">
								<p className="text-sm text-[#6b7687]">
									Até {DEALS_DEFAULT_LIMIT} negociações por página
									{paged?.total ? ` · ${paged.total} no total` : null}
								</p>
								<div className="flex items-center gap-2">
									<p className="mr-2 text-sm text-[#6b7687]">
										Página {page} de {Math.max(totalPages, 1)}
									</p>
									<Button
										className="rounded-md"
										disabled={page <= 1 || query.isPending}
										onClick={() => setPage((p) => p - 1)}
										size="icon-sm"
										type="button"
										variant="outline"
									>
										<ChevronLeft className="size-4" />
									</Button>
									<Button
										className="rounded-md"
										disabled={
											page >= Math.max(totalPages, 1) || query.isPending
										}
										onClick={() => setPage((p) => p + 1)}
										size="icon-sm"
										type="button"
										variant="outline"
									>
										<ChevronRight className="size-4" />
									</Button>
								</div>
							</div>
						</>
					) : null}
				</CardContent>
			</Card>

			<DealDetailsDialog
				deal={targetDeal}
				onClose={() => {
					setDetailsOpen(false);
					setTargetDeal(null);
				}}
				open={detailsOpen}
			/>

			<DealFormDialog
				isPending={updateDealMutation.isPending}
				onClose={() => {
					setEditOpen(false);
					setTargetDeal(null);
				}}
				onSubmit={handleEditSubmit}
				open={editOpen}
				targetDeal={targetDeal}
			/>

			<DealConfirmDialog
				confirmLabel="Confirmar exclusão"
				description={
					targetDeal
						? `A negociação «${targetDeal.title}» será removida permanentemente.`
						: 'Confirme a exclusão da negociação selecionada.'
				}
				error={dialogError}
				isPending={deleteDealMutation.isPending}
				onClose={() => {
					setDeleteOpen(false);
					setTargetDeal(null);
					setDialogError(null);
				}}
				onConfirm={handleDeleteConfirm}
				open={deleteOpen}
				title="Excluir negociação"
			/>
		</div>
	);
}

export { DealsPageContent };
