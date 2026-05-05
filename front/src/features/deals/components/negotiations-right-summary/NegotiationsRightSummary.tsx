'use client';

import { useMemo } from 'react';

import type { Deal } from '@/features/deals/model/deals.model';

import { ImportantActivitiesCard } from './ImportantActivitiesCard';
import { ImportanceSummaryCard } from './ImportanceSummaryCard';
import { PipelineSummaryCard } from './PipelineSummaryCard';
import {
	buildImportanceFromDeals,
	buildPipelineSummaryFromDeals,
	IMPORTANT_ACTIVITIES_MOCK,
} from './negotiations-right-summary.data';

type Props = {
	deals: Deal[];
};

function NegotiationsRightSummary({ deals }: Props) {
	const pipeline = useMemo(() => buildPipelineSummaryFromDeals(deals), [deals]);
	const importance = useMemo(() => buildImportanceFromDeals(deals), [deals]);

	return (
		<aside
			className="negotiations-right-in flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-clip"
			aria-label="Resumos e atividades"
		>
			<PipelineSummaryCard data={pipeline} />
			<ImportanceSummaryCard data={importance} />
			<ImportantActivitiesCard items={IMPORTANT_ACTIVITIES_MOCK} />
		</aside>
	);
}

export { NegotiationsRightSummary };
