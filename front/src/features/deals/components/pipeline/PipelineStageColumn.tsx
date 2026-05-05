'use client';

import { Plus } from 'lucide-react';
import type { DragEvent } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dealAllowsKanbanStageDrag } from '@/features/deals/lib/deal-edit-guard';
import type { Deal, DealStage } from '@/features/deals/model/deals.model';
import { NegotiationPipelineDealCard } from '@/features/deals/components/pipeline/NegotiationPipelineDealCard';

type Props = {
	title: string;
	stage: DealStage;
	deals: Deal[];
	showValues: boolean;
	onOpenDetails: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onDelete?: (deal: Deal) => void;
	onCreateDeal: () => void;
	draggedDealId?: string | null;
	dragOverStage?: DealStage | null;
	isDragTargetAllowed?: boolean;
	updatingDealId?: string | null;
	onCardDragStart?: (deal: Deal) => void;
	onCardDragEnd?: () => void;
	onColumnDragOver?: (stage: DealStage) => void;
	onColumnDragLeave?: (stage: DealStage) => void;
	onColumnDrop?: (stage: DealStage) => void;
	hasNextPage?: boolean;
	isLoadingMore?: boolean;
	onLoadMore?: () => void;
};

function PipelineStageColumn({
	title,
	stage,
	deals,
	showValues,
	onOpenDetails,
	onEdit,
	onDelete,
	onCreateDeal,
	draggedDealId,
	dragOverStage,
	isDragTargetAllowed = false,
	updatingDealId,
	onCardDragStart,
	onCardDragEnd,
	onColumnDragOver,
	onColumnDragLeave,
	onColumnDrop,
	hasNextPage = false,
	isLoadingMore = false,
	onLoadMore,
}: Props) {
	const isDragOver = dragOverStage === stage;

	function handleDragOver(event: DragEvent<HTMLDivElement>) {
		if (!draggedDealId) {
			return;
		}
		event.preventDefault();
		event.dataTransfer.dropEffect = isDragTargetAllowed ? 'move' : 'none';
		onColumnDragOver?.(stage);
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		if (!draggedDealId) {
			return;
		}
		event.preventDefault();
		onColumnDrop?.(stage);
	}

	return (
		<div
			className={cn(
				'min-w-0 pb-2 transition-all duration-200 ease-out',
				isDragOver && isDragTargetAllowed
					? 'bg-muted/20 ring-1 ring-border/80'
					: '',
				isDragOver && !isDragTargetAllowed ? 'bg-destructive/5' : '',
			)}
			onDragOver={handleDragOver}
			onDragLeave={() => onColumnDragLeave?.(stage)}
			onDrop={handleDrop}
		>
			<div className="sr-only">{title}</div>
			<div className="flex flex-col gap-[10px]">
				{isDragOver && isDragTargetAllowed ? (
					<div
						aria-hidden="true"
						className="h-[110px] rounded-[11px] border border-dashed border-[color:var(--brand-accent)]/35 bg-[color:var(--brand-accent-soft)]/25 transition-all duration-200 ease-out"
					/>
				) : null}

				{deals.map((deal) => (
					<NegotiationPipelineDealCard
						key={deal.id}
						deal={deal}
						showValues={showValues}
						draggable={dealAllowsKanbanStageDrag(deal)}
						isDragging={draggedDealId === deal.id}
						isStageUpdating={updatingDealId === deal.id}
						onDragStart={onCardDragStart}
						onDragEnd={onCardDragEnd}
						onOpenDetails={onOpenDetails}
						onDelete={onDelete}
						onEdit={onEdit}
					/>
				))}

				{hasNextPage ? (
					<Button
						type="button"
						variant="ghost"
						size="xs"
						className="mx-auto mt-1 h-7 rounded-full px-3 text-[12px] text-muted-foreground hover:bg-muted/40 hover:text-foreground"
						disabled={isLoadingMore}
						onClick={onLoadMore}
					>
						{isLoadingMore ? 'Carregando...' : 'Carregar mais'}
					</Button>
				) : null}

				<button
					type="button"
					onClick={onCreateDeal}
					className={cn(
						'mt-3 inline-flex h-7 w-full items-center justify-center gap-[7px] border-0 bg-transparent text-[13px] text-muted-foreground hover:text-foreground',
					)}
				>
					<Plus className="size-4" /> Adicionar negócio
				</button>
			</div>
		</div>
	);
}

export { PipelineStageColumn };
