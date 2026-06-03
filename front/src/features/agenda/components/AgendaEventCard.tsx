import { CalendarDays, CheckCircle2, MapPin, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { AgendaItem } from '../model/agenda.model';
import {
	agendaItemDate,
	agendaItemStatusLabel,
	agendaItemTypeLabel,
	agendaRecurrenceLabel,
	formatAgendaDate,
	formatAgendaTime,
} from '../lib/agenda-formatters';

type Props = {
	item: AgendaItem;
	onCancel: (id: string) => void;
	onComplete: (id: string) => void;
};

function AgendaEventCard({ item, onCancel, onComplete }: Props) {
	const date = agendaItemDate(item);
	const canComplete = item.type === 'TASK' && item.status === 'SCHEDULED';
	const canCancel = item.status === 'SCHEDULED';

	return (
		<Card className="rounded-lg border-border bg-card shadow-none">
			<CardContent className="flex min-w-0 items-start gap-4 p-4">
				<div
					aria-hidden="true"
					className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--kpi-surface-brand)] text-[color:var(--kpi-icon-brand)]"
				>
					<CalendarDays className="size-5" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
						<div className="min-w-0">
							<div className="mb-2 flex flex-wrap gap-2">
								<Badge variant="secondary">
									{agendaItemTypeLabel(item.type)}
								</Badge>
								<Badge variant="outline">
									{agendaItemStatusLabel(item.status)}
								</Badge>
								{item.recurrence !== 'NONE' ? (
									<Badge variant="outline">
										{agendaRecurrenceLabel(item.recurrence)}
									</Badge>
								) : null}
							</div>
							<h2 className="break-words text-sm font-semibold text-foreground">
								{item.title}
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								{formatAgendaDate(date)}
							</p>
							<p className="mt-0.5 text-sm font-medium text-foreground">
								{item.type === 'EVENT'
									? formatAgendaTime(item.startsAt, item.endsAt)
									: formatAgendaTime(item.dueAt)}
							</p>
						</div>
						<div className="flex shrink-0 flex-wrap gap-2">
							{canComplete ? (
								<Button
									aria-label={`Concluir tarefa ${item.title}`}
									onClick={() => onComplete(item.id)}
									size="sm"
									variant="outline"
								>
									<CheckCircle2 className="size-4" />
									Concluir
								</Button>
							) : null}
							{canCancel ? (
								<Button
									aria-label={`Cancelar item ${item.title}`}
									onClick={() => onCancel(item.id)}
									size="sm"
									variant="ghost"
								>
									<XCircle className="size-4" />
									Cancelar
								</Button>
							) : null}
						</div>
					</div>
					{item.location ? (
						<p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
							<MapPin className="size-4 shrink-0" />
							<span className="min-w-0 break-words">{item.location}</span>
						</p>
					) : null}
					{item.description ? (
						<p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">
							{item.description}
						</p>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}

export { AgendaEventCard };
