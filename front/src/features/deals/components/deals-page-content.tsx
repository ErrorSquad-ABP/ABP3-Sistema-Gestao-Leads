'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { ApiError } from '@/lib/http/api-error';

import {
	useDealsPipelineQuery,
	useLoadMorePipelineStageMutation,
} from '../hooks/deals.queries';
import {
	useDeleteDealMutation,
	useUpdateDealMutation,
} from '../hooks/deals.mutations';
import { getDealFormEditBlockReason } from '../lib/deal-edit-guard';
import type {
	Deal,
	DealImportance,
	DealPipelineStage,
	DealPipelineSortMode,
	DealStage,
	DealStatus,
	DealUpdateInput,
} from '../model/deals.model';
import { DealConfirmDialog } from './DealConfirmDialog';
import { DealCreateDialog } from './DealCreateDialog';
import { DealDetailsDialog } from './DealDetailsDialog';
import { DealFormDialog, getDealsErrorMessage } from './DealFormDialog';
import { NegotiationsPageTop } from './NegotiationsPageTop';
import { NegotiationsPipelineSection } from './pipeline/NegotiationsPipelineSection';

const PIPELINE_PAGE_SIZE = 3;
const INVALID_STAGE_MOVE_MESSAGE = 'Não é possível pular etapas da negociação.';
const STAGE_MOVE_SUCCESS_MESSAGE = 'Negociação movida com sucesso.';
const STAGE_MOVE_ERROR_MESSAGE = 'Não foi possível atualizar a negociação.';
const STAGE_MOVE_LOADING_MESSAGE = 'Atualizando negociação...';

const darkToastOptions = {
	style: {
		background: 'var(--sidebar)',
		color: 'var(--sidebar-foreground)',
		border: '1px solid var(--sidebar-border)',
	},
};

type DealsPageContentProps = {
	user: AuthenticatedUser;
};

function DealsPageContent({ user }: DealsPageContentProps) {
	const [statusFilter, setStatusFilter] = useState<'ALL' | DealStatus>('ALL');
	const [importanceFilter, setImportanceFilter] = useState<
		'ALL' | DealImportance
	>('ALL');
	const [search, setSearch] = useState('');
	const [pipelineSortMode, setPipelineSortMode] =
		useState<DealPipelineSortMode>('recent');

	const pipelineQuery = useMemo(() => {
		const base = {
			pageSize: PIPELINE_PAGE_SIZE,
			status: statusFilter === 'ALL' ? undefined : (statusFilter as DealStatus),
			importance:
				importanceFilter === 'ALL'
					? undefined
					: (importanceFilter as DealImportance),
			search,
			...(pipelineSortMode === 'value_asc'
				? { valueSort: 'asc' as const }
				: pipelineSortMode === 'value_desc'
					? { valueSort: 'desc' as const }
					: {}),
		};
		return base;
	}, [importanceFilter, pipelineSortMode, search, statusFilter]);
	const query = useDealsPipelineQuery(pipelineQuery);
	const loadMoreStageMutation = useLoadMorePipelineStageMutation(pipelineQuery);

	const deleteDealMutation = useDeleteDealMutation();
	const updateDealMutation = useUpdateDealMutation();

	const [detailsOpen, setDetailsOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [stageMoveError, setStageMoveError] = useState<string | null>(null);
	const [updatingStageDealId, setUpdatingStageDealId] = useState<string | null>(
		null,
	);
	const [targetDeal, setTargetDeal] = useState<Deal | null>(null);

	const pipeline = query.data;
	const stages = useMemo(() => pipeline?.stages ?? [], [pipeline?.stages]);
	const visibleDeals = useMemo(
		() => stages.flatMap((stage) => stage.items),
		[stages],
	);

	/** Alinha com a política do backend: só oferece editar/excluir quando há linhas com `canMutate` na vista atual. */
	const canMutateInView = useMemo(
		() => visibleDeals.some((d) => d.canMutate),
		[visibleDeals],
	);

	function handleLoadMoreStage(stage: DealPipelineStage) {
		if (!stage.hasNextPage || loadMoreStageMutation.isPending) {
			return;
		}
		loadMoreStageMutation.mutate({
			stage: stage.key,
			page: stage.page + 1,
		});
	}

	function handleInvalidStageMove() {
		toast.warning(INVALID_STAGE_MOVE_MESSAGE, {
			id: 'deal-stage-invalid-move',
			...darkToastOptions,
		});
	}

	async function handleMoveStage(deal: Deal, targetStage: DealStage) {
		setStageMoveError(null);
		setUpdatingStageDealId(deal.id);
		const toastId = toast.loading(STAGE_MOVE_LOADING_MESSAGE, {
			...darkToastOptions,
		});
		try {
			await updateDealMutation.mutateAsync({
				dealId: deal.id,
				payload: { stage: targetStage, value: undefined },
			});
			toast.success(STAGE_MOVE_SUCCESS_MESSAGE, {
				id: toastId,
				...darkToastOptions,
			});
		} catch (error) {
			setStageMoveError(getDealsErrorMessage(error));
			toast.error(STAGE_MOVE_ERROR_MESSAGE, {
				id: toastId,
				...darkToastOptions,
			});
		} finally {
			setUpdatingStageDealId(null);
		}
	}

	function openDetails(deal: Deal) {
		setTargetDeal(deal);
		setDetailsOpen(true);
	}

	function openEdit(deal: Deal) {
		const blockReason = getDealFormEditBlockReason(deal);
		if (blockReason) {
			toast.error(blockReason, {
				id: 'deal-edit-blocked',
				...darkToastOptions,
			});
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
			toast.success('Negociação excluída com sucesso.', {
				...darkToastOptions,
			});
			setDeleteOpen(false);
			setTargetDeal(null);
		} catch (error) {
			const message = getDealsErrorMessage(error);
			setDialogError(message);
			toast.error(message, {
				...darkToastOptions,
			});
		}
	}

	return (
		<div className="space-y-6" aria-busy={query.isPending ? 'true' : 'false'}>
			<NegotiationsPageTop
				deals={visibleDeals}
				onCreateDeal={() => setCreateOpen(true)}
				onSearchChange={setSearch}
				search={search}
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
							importanceFilter={importanceFilter}
							statusFilter={statusFilter}
							stages={stages}
							summaryDeals={visibleDeals}
							loadingStage={
								loadMoreStageMutation.isPending
									? loadMoreStageMutation.variables?.stage
									: null
							}
							updatingDealId={updatingStageDealId}
							stageMoveError={stageMoveError}
							onLoadMoreStage={handleLoadMoreStage}
							onMoveStage={handleMoveStage}
							onInvalidStageMove={handleInvalidStageMove}
							onImportanceFilterChange={setImportanceFilter}
							onStatusFilterChange={setStatusFilter}
							pipelineSortMode={pipelineSortMode}
							onPipelineSortModeChange={setPipelineSortMode}
							onCreateDeal={() => setCreateOpen(true)}
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

			{createOpen ? (
				<DealCreateDialog
					onClose={() => setCreateOpen(false)}
					open={createOpen}
					user={user}
				/>
			) : null}

			<DealFormDialog
				isPending={updateDealMutation.isPending}
				onClose={() => {
					setEditOpen(false);
					setTargetDeal(null);
				}}
				onDelete={(deal) => {
					setEditOpen(false);
					openDelete(deal);
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
