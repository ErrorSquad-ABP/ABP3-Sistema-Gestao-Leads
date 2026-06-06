import { CalendarClock, CheckSquare } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { AgendaItem } from '../model/agenda.model';
import {
	formatAgendaTime,
	isAgendaItemOverdue,
} from '../lib/agenda-formatters';
import { agendaTypeLabel } from '../lib/agenda-labels';

type Props = {
	item: AgendaItem;
};

function AgendaItemChip({ item }: Props) {
	const isDone = item.status === 'DONE';
	const isCancelled = item.status === 'CANCELLED';
	const isOverdue = isAgendaItemOverdue(item);
	const Icon = item.type === 'TASK' ? CheckSquare : CalendarClock;

	return (
		<div
			className={cn(
				'flex min-w-0 items-center gap-1 truncate rounded-sm border px-1.5 py-0.5 text-[11px] leading-4 text-foreground data-[muted=true]:text-muted-foreground',
				isOverdue
					? 'border-destructive/25 bg-destructive/10 text-destructive'
					: 'border-border bg-muted',
			)}
			data-muted={isDone || isCancelled}
			title={`${agendaTypeLabel(item.type)}: ${item.title}`}
		>
			<Icon aria-hidden="true" className="size-3 shrink-0" />
			<span className="shrink-0 font-medium">
				{item.type === 'EVENT'
					? formatAgendaTime(item.startsAt)
					: formatAgendaTime(item.dueAt)}
			</span>{' '}
			<span className="min-w-0 truncate">{item.title}</span>
			{isOverdue ? (
				<span className="shrink-0 font-semibold">Atrasada</span>
			) : null}
		</div>
	);
}

export { AgendaItemChip };
