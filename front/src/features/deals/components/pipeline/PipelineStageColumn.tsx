'use client';

import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Deal } from '@/features/deals/model/deals.model';
import { NegotiationPipelineDealCard } from '@/features/deals/components/pipeline/NegotiationPipelineDealCard';

type Props = {
	title: string;
	deals: Deal[];
	showValues: boolean;
	onOpenDetails: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onDelete?: (deal: Deal) => void;
};

function PipelineStageColumn({
	title,
	deals,
	showValues,
	onOpenDetails,
	onEdit,
	onDelete,
}: Props) {
	return (
		<div className="min-w-0 border-r border-[#eef2f6] pb-2 last:border-r-0">
			<div className="sr-only">{title}</div>
			<div className="flex flex-col gap-[10px]">
				{deals.map((deal) => (
					<NegotiationPipelineDealCard
						key={deal.id}
						deal={deal}
						showValues={showValues}
						onOpenDetails={onOpenDetails}
						onDelete={onDelete}
						onEdit={onEdit}
					/>
				))}

				<button
					type="button"
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
