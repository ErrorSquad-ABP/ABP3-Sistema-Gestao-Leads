import {
	CalendarClock,
	CheckCircle2,
	CheckSquare,
	MapPin,
	Pencil,
	MoveRight,
	XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { AgendaItem } from '../model/agenda.model';
import {
	agendaItemDate,
	agendaRecurrenceLabel,
	formatAgendaDate,
	formatAgendaTime,
	isAgendaItemOverdue,
} from '../lib/agenda-formatters';
import {
	agendaStatusLabel,
	agendaTypeLabel,
	agendaTypeVisual,
} from '../lib/agenda-labels';

type Props = {
	item: AgendaItem;
	onCancel: (id: string) => void;
	onComplete: (id: string) => void;
	onEdit: (item: AgendaItem) => void;
	onMove?: (item: AgendaItem) => void;
};

function AgendaEventCard({
	item,
	onCancel,
	onComplete,
	onEdit,
	onMove,
}: Props) {
	const date = agendaItemDate(item);
	const canComplete = item.status === 'SCHEDULED';
	const canCancel = item.status === 'SCHEDULED';
	const isOverdue = isAgendaItemOverdue(item);
	const visual = agendaTypeVisual(item.type);
	const Icon = item.type === 'TASK' ? CheckSquare : CalendarClock;

	return (
		<Card
			className={cn(
				'rounded-lg border-border bg-card shadow-none',
				isOverdue && 'border-destructive/25 bg-destructive/5',
			)}
		>
			<CardContent className="flex min-w-0 flex-col items-start gap-4 p-4 sm:flex-row">
				<div
					aria-hidden="true"
					className={cn(
						'flex size-11 shrink-0 items-center justify-center rounded-full',
						visual.iconClassName,
					)}
				>
					<Icon className="size-5" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex min-w-0 flex-col gap-4">
						<div className="min-w-0">
							<div className="mb-2 flex flex-wrap gap-2">
								<Badge className={visual.badgeClassName} variant="outline">
									{agendaTypeLabel(item.type)}
								</Badge>
								<Badge variant="outline">
									{agendaStatusLabel(item.status)}
								</Badge>
								{isOverdue ? (
									<Badge variant="destructive">Atrasada</Badge>
								) : null}
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
						<div className="flex w-full flex-wrap gap-2">
							<Button
								aria-label={`Editar atividade ${item.title}`}
								onClick={() => onEdit(item)}
								size="icon-sm"
								variant="outline"
							>
								<Pencil className="size-4" />
							</Button>
							{canCancel && onMove ? (
								<Button
									aria-label={`Mover atividade ${item.title}`}
									onClick={() => onMove(item)}
									size="icon-sm"
									variant="outline"
								>
									<MoveRight className="size-4" />
								</Button>
							) : null}
							{canComplete ? (
								<Button
									aria-label={`Concluir atividade ${item.title}`}
									onClick={() => onComplete(item.id)}
									size="icon-sm"
									variant="outline"
								>
									<CheckCircle2 className="size-4" />
								</Button>
							) : null}
							{canCancel ? (
								<Button
									aria-label={`Cancelar item ${item.title}`}
									onClick={() => onCancel(item.id)}
									size="icon-sm"
									variant="outline"
								>
									<XCircle className="size-4" />
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
					{item.lead ? (
						<p className="mt-3 text-sm text-muted-foreground">
							Lead:{' '}
							<span className="font-medium">{item.lead.customerName}</span>
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
