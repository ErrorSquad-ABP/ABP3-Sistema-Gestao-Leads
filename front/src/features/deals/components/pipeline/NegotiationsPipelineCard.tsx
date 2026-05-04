'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import type {
	Deal,
	DealImportance,
	DealPipelineSortMode,
	DealPipelineStage,
	DealStage,
	DealStatus,
} from '@/features/deals/model/deals.model';
import { PIPELINE_STAGES } from '@/features/deals/lib/pipeline';
import { PipelineControls } from '@/features/deals/components/pipeline/PipelineControls';
import { PipelineMotivationBanner } from '@/features/deals/components/pipeline/PipelineMotivationBanner';
import { PipelineStageColumn } from '@/features/deals/components/pipeline/PipelineStageColumn';
import { PipelineStageRibbon } from '@/features/deals/components/pipeline/PipelineStageRibbon';

type Props = {
	stages: DealPipelineStage[];
	importanceFilter: 'ALL' | DealImportance;
	statusFilter: 'ALL' | DealStatus;
	onOpenDetails: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onDelete?: (deal: Deal) => void;
	onCreateDeal: () => void;
	onMoveStage?: (deal: Deal, targetStage: DealStage) => void;
	onInvalidStageMove?: () => void;
	onImportanceFilterChange: (value: 'ALL' | DealImportance) => void;
	onStatusFilterChange: (value: 'ALL' | DealStatus) => void;
	pipelineSortMode: DealPipelineSortMode;
	onPipelineSortModeChange: (value: DealPipelineSortMode) => void;
	onLoadMoreStage?: (stage: DealPipelineStage) => void;
	loadingStage?: DealStage | null;
	updatingDealId?: string | null;
	stageMoveError?: string | null;
};

const INVALID_STAGE_MOVE_MESSAGE = 'Não é possível pular etapas da negociação.';

function stageIndex(stage: DealStage) {
	return PIPELINE_STAGES.findIndex((item) => item.key === stage);
}

function isAdjacentStageMove(from: DealStage, to: DealStage) {
	const fromIndex = stageIndex(from);
	const toIndex = stageIndex(to);
	return fromIndex >= 0 && toIndex >= 0 && Math.abs(toIndex - fromIndex) === 1;
}

function NegotiationsPipelineCard({
	stages,
	importanceFilter,
	statusFilter,
	onOpenDetails,
	onEdit,
	onDelete,
	onCreateDeal,
	onMoveStage,
	onInvalidStageMove,
	onImportanceFilterChange,
	onStatusFilterChange,
	pipelineSortMode,
	onPipelineSortModeChange,
	onLoadMoreStage,
	loadingStage,
	updatingDealId,
	stageMoveError,
}: Props) {
	const [showValues, setShowValues] = useState(true);
	const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
	const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
	const [localStageMoveError, setLocalStageMoveError] = useState<string | null>(
		null,
	);

	function clearDragState() {
		setDraggedDeal(null);
		setDragOverStage(null);
	}

	function canDropOnStage(stage: DealStage) {
		if (!draggedDeal) {
			return false;
		}
		return (
			draggedDeal.stage === stage ||
			isAdjacentStageMove(draggedDeal.stage, stage)
		);
	}

	function handleDropStage(stage: DealStage) {
		if (!draggedDeal) {
			return;
		}
		if (draggedDeal.stage === stage) {
			clearDragState();
			return;
		}
		if (!isAdjacentStageMove(draggedDeal.stage, stage)) {
			setLocalStageMoveError(INVALID_STAGE_MOVE_MESSAGE);
			onInvalidStageMove?.();
			clearDragState();
			return;
		}
		setLocalStageMoveError(null);
		onMoveStage?.(draggedDeal, stage);
		clearDragState();
	}

	return (
		<Card className="min-h-[672px] overflow-hidden rounded-[18px] border-border bg-white shadow-[0_6px_20px_rgba(15,23,42,0.035)]">
			<CardContent className="p-[18px_22px_16px]">
				<div className="flex flex-col gap-4 pb-[18px] lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<h2 className="text-[16.5px] font-extrabold leading-[1.2] tracking-[-0.01em] text-foreground">
								Funil de negociações
							</h2>
							<Info className="size-[14px] text-muted-foreground" />
						</div>
						<p className="text-[13.2px] text-muted-foreground">
							Arraste as negociações entre as etapas do funil.
						</p>
					</div>

					<PipelineControls
						importanceFilter={importanceFilter}
						statusFilter={statusFilter}
						showValues={showValues}
						pipelineSortMode={pipelineSortMode}
						onPipelineSortModeChange={onPipelineSortModeChange}
						onImportanceFilterChange={onImportanceFilterChange}
						onStatusFilterChange={onStatusFilterChange}
						onShowValuesChange={setShowValues}
					/>
				</div>

				<PipelineStageRibbon stages={stages} />

				{localStageMoveError || stageMoveError ? (
					<div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] font-medium text-destructive">
						{localStageMoveError ?? stageMoveError}
					</div>
				) : null}

				<div className="grid grid-cols-4 gap-x-3">
					{PIPELINE_STAGES.map((stage) => {
						const pipelineStage = stages.find((item) => item.key === stage.key);
						const stageKey = stage.key as DealStage;
						return (
							<PipelineStageColumn
								key={stage.key}
								title={stage.label}
								stage={stageKey}
								deals={pipelineStage?.items ?? []}
								showValues={showValues}
								draggedDealId={draggedDeal?.id ?? null}
								dragOverStage={dragOverStage}
								isDragTargetAllowed={canDropOnStage(stageKey)}
								updatingDealId={updatingDealId}
								onCardDragStart={(deal) => {
									setLocalStageMoveError(null);
									setDraggedDeal(deal);
								}}
								onCardDragEnd={clearDragState}
								onColumnDragOver={setDragOverStage}
								onColumnDragLeave={(currentStage) => {
									setDragOverStage((value) =>
										value === currentStage ? null : value,
									);
								}}
								onColumnDrop={handleDropStage}
								hasNextPage={pipelineStage?.hasNextPage ?? false}
								isLoadingMore={loadingStage === stage.key}
								onLoadMore={
									pipelineStage && onLoadMoreStage
										? () => onLoadMoreStage(pipelineStage)
										: undefined
								}
								onOpenDetails={onOpenDetails}
								onDelete={onDelete}
								onCreateDeal={onCreateDeal}
								onEdit={onEdit}
							/>
						);
					})}
				</div>

				<PipelineMotivationBanner />
			</CardContent>
		</Card>
	);
}

export { NegotiationsPipelineCard };
