import type { AgendaItem } from '../model/agenda.model';
import { formatAgendaTime } from '../lib/agenda-formatters';

type Props = {
	item: AgendaItem;
};

function AgendaItemChip({ item }: Props) {
	const isDone = item.status === 'DONE';
	const isCancelled = item.status === 'CANCELLED';

	return (
		<div
			className="truncate rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[11px] leading-4 text-foreground data-[muted=true]:text-muted-foreground"
			data-muted={isDone || isCancelled}
			title={item.title}
		>
			<span className="font-medium">
				{item.type === 'EVENT'
					? formatAgendaTime(item.startsAt)
					: formatAgendaTime(item.dueAt)}
			</span>{' '}
			{item.title}
		</div>
	);
}

export { AgendaItemChip };
