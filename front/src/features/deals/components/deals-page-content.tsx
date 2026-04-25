'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { ApiError } from '@/lib/http/api-error';

import { useDealsListQuery } from '../hooks/deals.queries';
import {
	useDeleteDealMutation,
	useUpdateDealMutation,
} from '../hooks/deals.mutations';
import type { Deal, DealStatus, DealUpdateInput } from '../model/deals.model';
import { DealConfirmDialog } from './DealConfirmDialog';
import { DealDetailsDialog } from './DealDetailsDialog';
import { DealFormDialog, getDealsErrorMessage } from './DealFormDialog';
import { NegotiationsPageTop } from './NegotiationsPageTop';
import { NegotiationsPipelineSection } from './pipeline/NegotiationsPipelineSection';

const DEALS_DEFAULT_LIMIT = 20;

function normalizeSearchValue(value: string) {
	return value.trim().toLowerCase();
}

function DealsPageContent() {
	const page = 1;
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

	return (
		<div className="space-y-6" aria-busy={query.isPending ? 'true' : 'false'}>
			<NegotiationsPageTop
				deals={deals}
				onSearchChange={setSearch}
				onStatusFilterChange={setStatusFilter}
				search={search}
				statusFilter={statusFilter}
			/>

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
				<CardContent className="space-y-5 pt-6">
					{query.isPending ? (
						<div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
							Carregando negociações...
						</div>
					) : null}

					{query.isSuccess ? (
						<NegotiationsPipelineSection
							deals={filteredDeals}
							onOpenDetails={openDetails}
							onDelete={canMutateInView ? openDelete : undefined}
							onEdit={canMutateInView ? openEdit : undefined}
						/>
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
