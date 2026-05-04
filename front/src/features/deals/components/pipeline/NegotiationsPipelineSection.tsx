'use client';

import { useSidebar } from '@/components/ui/sidebar';
import type {
	Deal,
	DealImportance,
	DealPipelineSortMode,
	DealPipelineStage,
	DealStage,
	DealStatus,
} from '@/features/deals/model/deals.model';
import { NegotiationsRightSummary } from '@/features/deals/components/negotiations-right-summary/NegotiationsRightSummary';
import { NegotiationsPipelineCard } from '@/features/deals/components/pipeline/NegotiationsPipelineCard';
import { cn } from '@/lib/utils';

type Props = {
	stages: DealPipelineStage[];
	summaryDeals: Deal[];
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

function NegotiationsPipelineSection({
	stages,
	summaryDeals,
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
	const { state } = useSidebar();
	const isCollapsed = state === 'collapsed';

	return (
		<div
			className={cn(
				'mx-auto grid grid-cols-1 items-start',
				isCollapsed
					? 'max-w-[min(100%,1460px)] gap-[18px] lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]'
					: 'max-w-none gap-0',
			)}
		>
			<div className="min-w-0">
				<NegotiationsPipelineCard
					importanceFilter={importanceFilter}
					statusFilter={statusFilter}
					stages={stages}
					loadingStage={loadingStage}
					updatingDealId={updatingDealId}
					stageMoveError={stageMoveError}
					onDelete={onDelete}
					onCreateDeal={onCreateDeal}
					onEdit={onEdit}
					onInvalidStageMove={onInvalidStageMove}
					onImportanceFilterChange={onImportanceFilterChange}
					onStatusFilterChange={onStatusFilterChange}
					pipelineSortMode={pipelineSortMode}
					onPipelineSortModeChange={onPipelineSortModeChange}
					onLoadMoreStage={onLoadMoreStage}
					onMoveStage={onMoveStage}
					onOpenDetails={onOpenDetails}
				/>
			</div>
			{isCollapsed ? (
				<div className="hidden min-w-0 max-w-full justify-self-stretch lg:block">
					<NegotiationsRightSummary deals={summaryDeals} />
				</div>
			) : null}
		</div>
	);
}

export { NegotiationsPipelineSection };
