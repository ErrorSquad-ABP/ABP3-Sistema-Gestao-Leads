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

const iconByStage: Record<PipelineStageKey, ComponentType<{ className?: string }>> =
	{
		INITIAL_CONTACT: PhoneCall,
		NEGOTIATION: Handshake,
		PROPOSAL: ScrollText,
		CLOSING: MessageSquareText,
	};

function PipelineStageRibbon({ grouped }: Props) {
	return (
		<div className="mb-4 overflow-hidden rounded-[14px] border border-border bg-white">
			<div className="grid grid-cols-4 gap-0">
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
							isLast={index === PIPELINE_STAGES.length - 1}
						/>
					);
				})}
			</div>
		</div>
	);
}

export { PipelineStageRibbon };
