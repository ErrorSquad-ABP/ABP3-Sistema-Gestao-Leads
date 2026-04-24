'use client';

import {
	Handshake,
	MessageSquareText,
	PhoneCall,
	ScrollText,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Deal } from '@/features/deals/model/deals.model';
import {
	PIPELINE_STAGES,
	sumDealsValueBrl,
	type PipelineStageKey,
} from '@/features/deals/lib/pipeline';

type Props = {
	grouped: Record<PipelineStageKey, Deal[]>;
};

const stageIconClass = 'size-4 text-muted-foreground';

const iconByStage: Record<PipelineStageKey, React.ComponentType<{ className?: string }>> =
	{
		INITIAL_CONTACT: PhoneCall,
		NEGOTIATION: Handshake,
		PROPOSAL: ScrollText,
		CLOSING: MessageSquareText,
	};

function PipelineStagesHeader({ grouped }: Props) {
	return (
		<div className="overflow-hidden rounded-2xl border border-border bg-white">
			<div className="grid grid-cols-4">
				{PIPELINE_STAGES.map((stage, idx) => {
					const deals = grouped[stage.key];
					const total = sumDealsValueBrl(deals);
					const countLabel = `${deals.length} negociações`;
					const isFirst = idx === 0;
					const StageIcon = iconByStage[stage.key];

					return (
						<div
							key={stage.key}
							className={cn(
								'relative px-4 py-3',
								isFirst ? 'bg-[color:var(--brand-accent-soft)]/60' : 'bg-muted/20',
							)}
						>
							<div className="flex items-center gap-2">
								<StageIcon className={stageIconClass} aria-hidden="true" />
								<p className="text-sm font-semibold text-foreground">
									{stage.label}
								</p>
							</div>
							<p className="mt-1 text-xs text-muted-foreground">{countLabel}</p>
							<p className="mt-1 text-xs font-semibold text-foreground">{total}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export { PipelineStagesHeader };
