'use client';

import {
	Handshake,
	MessageSquareText,
	PhoneCall,
	ScrollText,
} from 'lucide-react';
import type { ComponentType } from 'react';

import type { DealPipelineStage } from '@/features/deals/model/deals.model';
import {
	PIPELINE_STAGES,
	type PipelineStageKey,
} from '@/features/deals/lib/pipeline';
import { PipelineStageRibbonItem } from '@/features/deals/components/pipeline/PipelineStageRibbonItem';

type Props = {
	stages: DealPipelineStage[];
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

function formatStageTotalValue(value: string | null) {
	if (value === null) {
		return '—';
	}
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		return '—';
	}
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(parsed);
}

function PipelineStageRibbon({ stages }: Props) {
	return (
		<div className="mb-4 grid min-w-0 grid-cols-4 gap-0 overflow-hidden rounded-t-[12px] bg-card">
			{PIPELINE_STAGES.map((stage, index) => {
				const pipelineStage = stages.find((item) => item.key === stage.key);
				return (
					<PipelineStageRibbonItem
						key={stage.key}
						icon={iconByStage[stage.key]}
						label={stage.label}
						count={pipelineStage?.count ?? 0}
						total={formatStageTotalValue(pipelineStage?.totalValue ?? null)}
						index={index}
					/>
				);
			})}
		</div>
	);
}

export { PipelineStageRibbon };
