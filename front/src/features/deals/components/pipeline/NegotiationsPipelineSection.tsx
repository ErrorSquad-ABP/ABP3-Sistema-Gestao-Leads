'use client';

import { useSidebar } from '@/components/ui/sidebar';
import type { Deal } from '@/features/deals/model/deals.model';
import { NegotiationsRightSummary } from '@/features/deals/components/negotiations-right-summary/NegotiationsRightSummary';
import { NegotiationsPipelineCard } from '@/features/deals/components/pipeline/NegotiationsPipelineCard';
import { cn } from '@/lib/utils';

type Props = {
	deals: Deal[];
	onOpenDetails: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onDelete?: (deal: Deal) => void;
};

function NegotiationsPipelineSection({
	deals,
	onOpenDetails,
	onEdit,
	onDelete,
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
					deals={deals}
					onDelete={onDelete}
					onEdit={onEdit}
					onOpenDetails={onOpenDetails}
				/>
			</div>
			{isCollapsed ? (
				<div className="hidden min-w-0 max-w-full justify-self-stretch lg:block">
					<NegotiationsRightSummary deals={deals} />
				</div>
			) : null}
		</div>
	);
}

export { NegotiationsPipelineSection };
