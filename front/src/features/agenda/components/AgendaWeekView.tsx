import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { AgendaItemChip } from './AgendaItemChip';
import type { AgendaItem } from '../model/agenda.model';
import {
	addDays,
	agendaDateKey,
	formatAgendaDate,
} from '../lib/agenda-formatters';

type Props = {
	itemsByDate: ReadonlyMap<string, readonly AgendaItem[]>;
	onCreateDate: (date: Date) => void;
	onSelectDate: (date: Date) => void;
	selectedDate: Date;
};

const WEEK_DAYS = 7;

function startOfWeek(date: Date) {
	const start = new Date(date);
	start.setDate(date.getDate() - date.getDay());
	start.setHours(0, 0, 0, 0);
	return start;
}

function AgendaWeekView({
	itemsByDate,
	onCreateDate,
	onSelectDate,
	selectedDate,
}: Props) {
	const todayKey = agendaDateKey(new Date());
	const selectedKey = agendaDateKey(selectedDate);
	const days = Array.from({ length: WEEK_DAYS }, (_, index) =>
		addDays(startOfWeek(selectedDate), index),
	);

	return (
		<div className="grid gap-3 md:grid-cols-7">
			{days.map((date) => {
				const key = agendaDateKey(date);
				const items = itemsByDate.get(key) ?? [];
				return (
					<Card
						className={cn(
							'min-h-44 rounded-lg border-border bg-card p-3 shadow-none',
							key === selectedKey && 'border-primary ring-1 ring-primary',
							key === todayKey && 'bg-primary/5',
						)}
						key={key}
					>
						<button
							className="w-full text-left"
							onClick={() => onSelectDate(date)}
							type="button"
						>
							<p className="text-xs font-semibold uppercase text-muted-foreground">
								{formatAgendaDate(date.toISOString()).split(',')[0]}
							</p>
							<p className="text-lg font-semibold">{date.getDate()}</p>
						</button>
						<div className="mt-3 space-y-1">
							{items.slice(0, 5).map((item) => (
								<AgendaItemChip item={item} key={`${item.id}-${key}`} />
							))}
							{items.length > 5 ? (
								<p className="text-xs text-muted-foreground">
									+{items.length - 5} atividades
								</p>
							) : null}
						</div>
						<Button
							className="mt-3 w-full"
							onClick={() => onCreateDate(date)}
							size="sm"
							type="button"
							variant="outline"
						>
							<Plus className="size-4" />
							Criar
						</Button>
					</Card>
				);
			})}
		</div>
	);
}

export { AgendaWeekView };
