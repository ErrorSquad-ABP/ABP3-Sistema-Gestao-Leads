import {
	AlertTriangle,
	CalendarClock,
	CheckSquare,
	Clock3,
} from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

import { KpiCard } from '@/components/metrics/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AgendaEventList } from './AgendaEventList';
import type { AgendaItem, AgendaMetrics } from '../model/agenda.model';
import {
	agendaDateKey,
	agendaItemDate,
	isAgendaItemOverdue,
} from '../lib/agenda-formatters';

type Props = {
	items: readonly AgendaItem[];
	metrics?: AgendaMetrics | null;
	onCancel: (id: string) => void;
	onComplete: (id: string) => void;
	onEdit: (item: AgendaItem) => void;
	onMove?: (item: AgendaItem) => void;
	remindersPanel?: ReactNode;
};

const TODAY_LIST_LIMIT = 5;

function sortAgendaItems(a: AgendaItem, b: AgendaItem) {
	return (
		new Date(agendaItemDate(a)).getTime() -
		new Date(agendaItemDate(b)).getTime()
	);
}

function buildTodayOverview(items: readonly AgendaItem[], now = new Date()) {
	const todayKey = agendaDateKey(now);
	const scheduledItems = items.filter((item) => item.status === 'SCHEDULED');
	const overdueItems = scheduledItems
		.filter((item) => isAgendaItemOverdue(item, now))
		.sort(sortAgendaItems);
	const todayItems = scheduledItems
		.filter((item) => agendaDateKey(agendaItemDate(item)) === todayKey)
		.sort(sortAgendaItems);
	const upcomingTodayItems = todayItems.filter(
		(item) => !isAgendaItemOverdue(item, now),
	);
	const pendingTasks = todayItems.filter((item) => item.type === 'TASK');
	const nextEvent =
		upcomingTodayItems.find((item) => item.type === 'EVENT') ?? null;

	return {
		displayItems:
			overdueItems.length > 0
				? overdueItems.slice(0, TODAY_LIST_LIMIT)
				: upcomingTodayItems.slice(0, TODAY_LIST_LIMIT),
		nextEvent,
		overdueItems,
		pendingTasks,
		todayItems,
		upcomingTodayItems,
	};
}

function AgendaTodayPanel({
	items,
	metrics = null,
	onCancel,
	onComplete,
	onEdit,
	onMove,
	remindersPanel,
}: Props) {
	const overview = useMemo(() => buildTodayOverview(items), [items]);
	const displayItems = overview.displayItems;

	return (
		<section className="space-y-4" aria-labelledby="agenda-today-title">
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<KpiCard
					description="Atividades agendadas para hoje"
					icon={<CalendarClock className="size-5" />}
					title="Atividades hoje"
					value={String(
						metrics?.activitiesTodayCount ?? overview.todayItems.length,
					)}
					variant="brand"
				/>
				<KpiCard
					description="Precisam de atenção"
					icon={<AlertTriangle className="size-5" />}
					title="Atrasadas"
					value={String(metrics?.overdueCount ?? overview.overdueItems.length)}
					variant={
						(metrics?.overdueCount ?? overview.overdueItems.length) > 0
							? 'danger-soft'
							: 'neutral'
					}
				/>
				<KpiCard
					description="Tarefas ainda em aberto"
					icon={<CheckSquare className="size-5" />}
					title="Tarefas pendentes"
					value={String(
						metrics?.pendingTasksCount ?? overview.pendingTasks.length,
					)}
					variant="success"
				/>
				<KpiCard
					description="Finalizadas neste mês"
					icon={<Clock3 className="size-5" />}
					title="Concluídas no mês"
					value={String(metrics?.completedThisMonthCount ?? 0)}
					variant="warning"
				/>
			</div>

			<div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
				<Card className="min-w-0 rounded-lg border-border bg-card shadow-none">
					<CardHeader>
						<CardTitle className="text-base" id="agenda-today-title">
							Hoje
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							{overview.overdueItems.length > 0
								? 'Atividades atrasadas aparecem primeiro.'
								: 'Próximas atividades do dia.'}
						</p>
					</CardHeader>
					<CardContent>
						{displayItems.length > 0 ? (
							<AgendaEventList
								items={displayItems}
								onCancel={onCancel}
								onComplete={onComplete}
								onEdit={onEdit}
								onMove={onMove}
							/>
						) : (
							<div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
								Nenhuma atividade pendente para hoje.
							</div>
						)}
					</CardContent>
				</Card>
				{remindersPanel}
			</div>
		</section>
	);
}

export { AgendaTodayPanel, buildTodayOverview };
