'use client';

import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import type { Deal } from '@/features/deals/model/deals.model';
import {
	groupDealsByStage,
	PIPELINE_STAGES,
	type PipelineStageKey,
} from '@/features/deals/lib/pipeline';
import { PipelineControls } from '@/features/deals/components/pipeline/PipelineControls';
import { PipelineMotivationBanner } from '@/features/deals/components/pipeline/PipelineMotivationBanner';
import { PipelineStageColumn } from '@/features/deals/components/pipeline/PipelineStageColumn';
import { PipelineStageRibbon } from '@/features/deals/components/pipeline/PipelineStageRibbon';

type Props = {
	deals: Deal[];
	onOpenDetails: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onDelete?: (deal: Deal) => void;
};

function NegotiationsPipelineCard({ deals, onOpenDetails, onEdit, onDelete }: Props) {
	const [showValues, setShowValues] = useState(true);

	const grouped = useMemo(() => groupDealsByStage(deals), [deals]);

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
						showValues={showValues}
						onShowValuesChange={setShowValues}
					/>
				</div>

				<PipelineStageRibbon grouped={grouped} />

				<div className="grid grid-cols-4 gap-x-3">
					{PIPELINE_STAGES.map((stage) => (
						<PipelineStageColumn
							key={stage.key}
							title={stage.label}
							deals={grouped[stage.key as PipelineStageKey]}
							showValues={showValues}
							onOpenDetails={onOpenDetails}
							onDelete={onDelete}
							onEdit={onEdit}
						/>
					))}
				</div>

				<PipelineMotivationBanner />
			</CardContent>
		</Card>
	);
}

export { NegotiationsPipelineCard };
