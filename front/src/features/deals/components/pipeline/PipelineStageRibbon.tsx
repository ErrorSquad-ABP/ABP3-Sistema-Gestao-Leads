'use client';

import {
	Handshake,
	MessageSquareText,
	PhoneCall,
	ScrollText,
} from 'lucide-react';
import type { ComponentType } from 'react';

import type { Deal } from '@/features/deals/model/deals.model';
import {
	PIPELINE_STAGES,
	sumDealsValueBrl,
	type PipelineStageKey,
} from '@/features/deals/lib/pipeline';
import { PipelineStageRibbonItem } from '@/features/deals/components/pipeline/PipelineStageRibbonItem';

type Props = {
	grouped: Record<PipelineStageKey, Deal[]>;
};

const iconByStage: Record<
	PipelineStageKey,
	ComponentType<{ className?: string }>
> = {
	INITIAL_CONTACT: PhoneCall,
	NEGOTIATION: Handshake,
	PROPOSAL: ScrollText,
	CLOSING: MessageSquareText,
};

function PipelineStageRibbon({ grouped }: Props) {
	return (
		<div className="mb-4 grid min-w-0 grid-cols-4 gap-2 overflow-hidden rounded-t-[12px] bg-card">
			{PIPELINE_STAGES.map((stage, index) => {
				const deals = grouped[stage.key];
				return (
					<PipelineStageRibbonItem
						key={stage.key}
						icon={iconByStage[stage.key]}
						label={stage.label}
						count={deals.length}
						total={sumDealsValueBrl(deals)}
						index={index}
					/>
				);
			})}
		</div>
	);
}

export { PipelineStageRibbon };
