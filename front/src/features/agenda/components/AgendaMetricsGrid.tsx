import {
	AlertTriangle,
	CalendarClock,
	CheckSquare,
	Clock3,
} from 'lucide-react';
import { useMemo } from 'react';

import { KpiCard } from '@/components/metrics/KpiCard';

import type { AgendaItem, AgendaMetrics } from '../model/agenda.model';
import { buildTodayOverview } from './AgendaTodayPanel';

type AgendaMetricsGridProps = {
	items: readonly AgendaItem[];
	metrics?: AgendaMetrics | null;
};

function AgendaMetricsGrid({ items, metrics = null }: AgendaMetricsGridProps) {
	const overview = useMemo(() => buildTodayOverview(items), [items]);

	return (
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
				value={String(
					metrics?.overdueCount ?? overview.overdueItems.length,
				)}
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
	);
}

export { AgendaMetricsGrid };
