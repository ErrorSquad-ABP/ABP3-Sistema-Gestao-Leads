import { AgendaItemChip } from './AgendaItemChip';
import type { AgendaItem } from '../model/agenda.model';

type CalendarDay = {
	date: Date;
	isCurrentMonth: boolean;
	isSelected: boolean;
	isToday: boolean;
	items: readonly AgendaItem[];
	key: string;
};

type Props = {
	days: readonly CalendarDay[];
	onCreateDate: (date: Date) => void;
	onSelectDate: (date: Date) => void;
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
const MAX_VISIBLE_ITEMS_PER_DAY = 3;

function AgendaCalendarMonth({ days, onCreateDate, onSelectDate }: Props) {
	return (
		<section
			aria-label="Calendário mensal"
			className="overflow-hidden rounded-lg border border-border bg-card"
		>
			<div className="grid grid-cols-7 border-b border-border bg-muted/40">
				{WEEKDAYS.map((weekday) => (
					<div
						className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground"
						key={weekday}
					>
						{weekday}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7">
				{days.map((day) => {
					const visibleItems = day.items.slice(0, MAX_VISIBLE_ITEMS_PER_DAY);
					const hiddenCount = day.items.length - visibleItems.length;

					return (
						<div
							className="relative min-h-24 min-w-0 border-border border-r border-b transition hover:bg-muted/60 sm:min-h-32"
							key={day.key}
						>
							<button
								aria-label={`Selecionar dia ${day.date.getDate()}`}
								aria-pressed={day.isSelected}
								className="flex h-full min-h-24 w-full min-w-0 flex-col gap-1 p-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-32 sm:p-2"
								onClick={() => onSelectDate(day.date)}
								type="button"
							>
								<span
									className="flex size-7 items-center justify-center rounded-full text-xs font-semibold data-[current=false]:text-muted-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[today=true]:ring-2 data-[today=true]:ring-primary/35"
									data-current={day.isCurrentMonth}
									data-selected={day.isSelected}
									data-today={day.isToday}
								>
									{day.date.getDate()}
								</span>
								<div className="min-w-0 space-y-1 pr-6">
									{visibleItems.map((item) => (
										<AgendaItemChip item={item} key={item.id} />
									))}
									{hiddenCount > 0 ? (
										<p className="text-[11px] font-medium text-muted-foreground">
											+{hiddenCount}
										</p>
									) : null}
								</div>
							</button>
							<button
								aria-label={`Criar atividade em ${day.date.toLocaleDateString('pt-BR')}`}
								className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-muted-foreground opacity-80 transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								onClick={() => onCreateDate(day.date)}
								type="button"
							>
								+
							</button>
						</div>
					);
				})}
			</div>
		</section>
	);
}

export { AgendaCalendarMonth };
export type { CalendarDay };
