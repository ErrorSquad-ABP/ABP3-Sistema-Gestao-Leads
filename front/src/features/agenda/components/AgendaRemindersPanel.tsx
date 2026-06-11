import { AlertTriangle, Bell } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AgendaItem } from '../model/agenda.model';
import {
	agendaDateKey,
	agendaItemDate,
	formatAgendaDateTime,
	isAgendaItemOverdue,
} from '../lib/agenda-formatters';

type Props = {
	items: readonly AgendaItem[];
};

const NEXT_EVENT_WINDOW_MS = 2 * 60 * 60 * 1000;
const REMINDERS_LIMIT = 5;

function sortReminderItems(a: AgendaItem, b: AgendaItem) {
	return (
		new Date(agendaItemDate(a)).getTime() -
		new Date(agendaItemDate(b)).getTime()
	);
}

function buildAgendaReminders(items: readonly AgendaItem[], now = new Date()) {
	const todayKey = agendaDateKey(now);
	const scheduledItems = items.filter((item) => item.status === 'SCHEDULED');
	return scheduledItems
		.filter((item) => {
			if (isAgendaItemOverdue(item, now)) {
				return true;
			}
			const date = new Date(agendaItemDate(item));
			if (Number.isNaN(date.getTime())) {
				return false;
			}
			if (item.type === 'TASK') {
				return agendaDateKey(date) === todayKey;
			}
			const diff = date.getTime() - now.getTime();
			return diff >= 0 && diff <= NEXT_EVENT_WINDOW_MS;
		})
		.sort(sortReminderItems)
		.slice(0, REMINDERS_LIMIT);
}

function AgendaRemindersPanel({ items }: Props) {
	const now = new Date();
	const reminders = buildAgendaReminders(items, now);

	return (
		<Card className="rounded-lg border-border bg-card shadow-none">
			<CardHeader className="flex flex-row items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-full bg-warning-soft text-warning">
					<Bell className="size-5" />
				</div>
				<div>
					<CardTitle className="text-base">Lembretes</CardTitle>
					<p className="text-sm text-muted-foreground">
						Atrasos e atividades que pedem atenção agora.
					</p>
				</div>
			</CardHeader>
			<CardContent>
				{reminders.length > 0 ? (
					<ul className="space-y-2">
						{reminders.map((item) => (
							<li
								className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
								key={item.id}
							>
								<div>
									<p className="font-medium">{item.title}</p>
									<p className="text-muted-foreground">
										{formatAgendaDateTime(agendaItemDate(item))}
									</p>
								</div>
								{isAgendaItemOverdue(item, now) ? (
									<Badge variant="destructive">
										<AlertTriangle className="size-3" />
										Atrasada
									</Badge>
								) : (
									<Badge variant="outline">Próxima</Badge>
								)}
							</li>
						))}
					</ul>
				) : (
					<p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
						Nenhum lembrete importante agora.
					</p>
				)}
			</CardContent>
		</Card>
	);
}

export { AgendaRemindersPanel, buildAgendaReminders };
