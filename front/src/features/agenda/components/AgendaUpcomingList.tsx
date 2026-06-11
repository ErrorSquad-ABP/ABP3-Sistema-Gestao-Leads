import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AgendaEventList } from './AgendaEventList';
import type { AgendaItem } from '../model/agenda.model';
import {
	agendaDateKey,
	agendaItemDate,
	addDays,
	isAgendaItemOverdue,
} from '../lib/agenda-formatters';

type Props = {
	items: readonly AgendaItem[];
	onCancel: (id: string) => void;
	onComplete: (id: string) => void;
	onDelete: (item: AgendaItem) => void;
	onEdit: (item: AgendaItem) => void;
	onMove: (item: AgendaItem) => void;
};

const UPCOMING_DAYS = 7;

function buildAgendaUpcomingGroups(
	items: readonly AgendaItem[],
	now = new Date(),
) {
	const todayKey = agendaDateKey(now);
	const tomorrowKey = agendaDateKey(addDays(now, 1));
	const upcomingEnd = addDays(now, UPCOMING_DAYS);
	const scheduledItems = items.filter((item) => item.status === 'SCHEDULED');
	const overdueItems = scheduledItems.filter((item) =>
		isAgendaItemOverdue(item, now),
	);
	const todayItems = scheduledItems.filter(
		(item) =>
			agendaDateKey(agendaItemDate(item)) === todayKey &&
			!isAgendaItemOverdue(item, now),
	);
	const tomorrowItems = scheduledItems.filter(
		(item) => agendaDateKey(agendaItemDate(item)) === tomorrowKey,
	);
	const nextItems = scheduledItems.filter((item) => {
		const date = new Date(agendaItemDate(item));
		const key = agendaDateKey(date);
		return (
			key !== todayKey &&
			key !== tomorrowKey &&
			date <= upcomingEnd &&
			date >= now
		);
	});

	return [
		{ label: 'Atrasadas', items: overdueItems },
		{ label: 'Hoje', items: todayItems },
		{ label: 'Amanhã', items: tomorrowItems },
		{ label: 'Próximos 7 dias', items: nextItems },
	];
}

function AgendaUpcomingList({
	items,
	onCancel,
	onComplete,
	onDelete,
	onEdit,
	onMove,
}: Props) {
	const groups = buildAgendaUpcomingGroups(items);

	return (
		<Card className="rounded-lg border-border bg-card shadow-none">
			<CardHeader>
				<CardTitle className="text-base">Lista operacional</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				{groups.map((group) => (
					<section className="space-y-2" key={group.label}>
						<h3 className="text-sm font-semibold">{group.label}</h3>
						{group.items.length > 0 ? (
							<AgendaEventList
								items={group.items}
								onCancel={onCancel}
								onComplete={onComplete}
								onDelete={onDelete}
								onEdit={onEdit}
								onMove={onMove}
							/>
						) : (
							<p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
								Nenhuma atividade.
							</p>
						)}
					</section>
				))}
			</CardContent>
		</Card>
	);
}

export { AgendaUpcomingList, buildAgendaUpcomingGroups };
