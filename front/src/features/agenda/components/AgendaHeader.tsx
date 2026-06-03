import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
	monthLabel: string;
	onCreateClick: () => void;
	onNextMonth: () => void;
	onPreviousMonth: () => void;
	onTodayClick: () => void;
};

function AgendaHeader({
	monthLabel,
	onCreateClick,
	onNextMonth,
	onPreviousMonth,
	onTodayClick,
}: Props) {
	return (
		<header className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-none md:flex-row md:items-center md:justify-between">
			<div className="min-w-0">
				<div className="flex items-center gap-2">
					<div className="flex size-10 items-center justify-center rounded-full bg-[color:var(--kpi-surface-brand)] text-[color:var(--kpi-icon-brand)]">
						<CalendarDays className="size-5" />
					</div>
					<div>
						<h1 className="text-xl font-semibold text-foreground">Agenda</h1>
						<p className="text-sm text-muted-foreground">
							Meus compromissos e próximas atividades.
						</p>
					</div>
				</div>
			</div>
			<div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
				<div
					className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background p-1 md:w-auto"
					aria-label="Navegação de mês da agenda"
					role="group"
				>
					<Button
						aria-label="Mês anterior"
						onClick={onPreviousMonth}
						size="icon"
						variant="ghost"
					>
						<ChevronLeft className="size-4" />
					</Button>
					<p className="min-w-32 text-center text-sm font-semibold capitalize text-foreground">
						{monthLabel}
					</p>
					<Button
						aria-label="Próximo mês"
						onClick={onNextMonth}
						size="icon"
						variant="ghost"
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>
				<Button onClick={onTodayClick} size="sm" variant="outline">
					Hoje
				</Button>
				<Button onClick={onCreateClick} size="sm">
					Nova atividade
				</Button>
			</div>
		</header>
	);
}

export { AgendaHeader };
