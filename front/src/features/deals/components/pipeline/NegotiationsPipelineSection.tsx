'use client';

import { useSidebar } from '@/components/ui/sidebar';
import type { Deal } from '@/features/deals/model/deals.model';
import { NegotiationsPipelineCard } from '@/features/deals/components/pipeline/NegotiationsPipelineCard';
import { PipelineRightPlaceholder } from '@/features/deals/components/pipeline/PipelineRightPlaceholder';
import { cn } from '@/lib/utils';

type Props = {
	deals: Deal[];
	onOpenDetails: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onDelete?: (deal: Deal) => void;
};

function NegotiationsPipelineSection({ deals, onOpenDetails, onEdit, onDelete }: Props) {
	const { state } = useSidebar();
	const isCollapsed = state === 'collapsed';

	return (
		<div
			className={cn(
				'mx-auto grid grid-cols-1 items-start',
				isCollapsed
					? 'max-w-[1460px] gap-[18px] lg:grid-cols-[minmax(820px,1fr)_340px]'
					: 'max-w-none gap-0',
			)}
		>
			<div className="min-w-0">
				<NegotiationsPipelineCard
					deals={deals}
					onDelete={onDelete}
					onEdit={onEdit}
					onOpenDetails={onOpenDetails}
				/>
			</div>
			{isCollapsed ? (
				<div className="hidden lg:block">
					<PipelineRightPlaceholder />
				</div>
			) : null}
		</div>
	);
}

export { NegotiationsPipelineSection };
