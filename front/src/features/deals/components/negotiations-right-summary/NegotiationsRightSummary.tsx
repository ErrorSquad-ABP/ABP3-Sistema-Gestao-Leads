'use client';

import { useMemo } from 'react';

import { useAgendaItemsQuery } from '@/features/agenda/hooks/agenda.queries';
import type { Deal } from '@/features/deals/model/deals.model';

import {
	ImportantActivitiesCard,
	type ImportantActivitiesViewStatus,
} from './ImportantActivitiesCard';
import { ImportanceSummaryCard } from './ImportanceSummaryCard';
import { PipelineSummaryCard } from './PipelineSummaryCard';
import {
	buildImportanceFromDeals,
	buildPipelineSummaryFromDeals,
} from './negotiations-right-summary.data';

type Props = {
	deals: Deal[];
};

function NegotiationsRightSummary({ deals }: Props) {
	const pipeline = useMemo(() => buildPipelineSummaryFromDeals(deals), [deals]);
	const importance = useMemo(() => buildImportanceFromDeals(deals), [deals]);
	const agendaItemsQuery = useAgendaItemsQuery({
		limit: 5,
		status: 'SCHEDULED',
	});

	const activitiesStatus = useMemo<ImportantActivitiesViewStatus>(() => {
		if (agendaItemsQuery.isPending) {
			return 'loading';
		}
		if (agendaItemsQuery.isError || !agendaItemsQuery.data) {
			return 'error';
		}
		return agendaItemsQuery.data.items.length > 0 ? 'ready' : 'empty';
	}, [
		agendaItemsQuery.data,
		agendaItemsQuery.isError,
		agendaItemsQuery.isPending,
	]);

	return (
		<aside
			className="negotiations-right-in flex w-full max-w-full min-w-0 flex-col gap-4 overflow-x-clip"
			aria-label="Resumos e atividades"
		>
			<PipelineSummaryCard data={pipeline} />
			<ImportanceSummaryCard data={importance} />
			<ImportantActivitiesCard
				items={agendaItemsQuery.data?.items ?? []}
				onRetry={() => {
					agendaItemsQuery.refetch();
				}}
				status={activitiesStatus}
			/>
		</aside>
	);
}

export { NegotiationsRightSummary };
