'use client';

import { CalendarDays, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AgendaItem } from '@/features/agenda/model/agenda.model';
import { agendaItemDate } from '@/features/agenda/lib/agenda-formatters';

type ImportantActivitiesViewStatus = 'empty' | 'error' | 'loading' | 'ready';

type Props = {
	items: readonly AgendaItem[];
	onRetry: () => void;
	status: ImportantActivitiesViewStatus;
};

function formatItemTime(item: AgendaItem): string {
	const value = agendaItemDate(item);
	const start = new Date(value);
	if (Number.isNaN(start.getTime())) {
		return value;
	}
	return new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		month: 'short',
		weekday: 'short',
	}).format(start);
}

function RetryAction({
	children,
	onClick,
}: {
	readonly children: string;
	readonly onClick: () => void;
}) {
	return (
		<Button
			className="mt-3 w-full"
			onClick={onClick}
			size="sm"
			variant="outline"
		>
			{children}
		</Button>
	);
}

function ImportantActivitiesCard({ items, onRetry, status }: Props) {
	const shouldShowEmptyAgenda =
		status === 'empty' || (status === 'ready' && items.length === 0);

	return (
		<Card className="max-w-full min-w-0 rounded-xl border border-border/90 bg-white shadow-none">
			<CardContent className="p-4 pt-4">
				<div className="flex items-start justify-between gap-2">
					<h3 className="text-[15px] font-extrabold text-foreground">Agenda</h3>
					{status === 'error' ? (
						<Button
							aria-label="Tentar novamente"
							className="size-8 shrink-0"
							onClick={onRetry}
							size="icon-sm"
							variant="ghost"
						>
							<RefreshCw className="size-4" />
						</Button>
					) : null}
				</div>

				{status === 'loading' ? (
					<p className="mt-3.5 text-sm text-muted-foreground" role="status">
						Carregando atividades...
					</p>
				) : null}

				{shouldShowEmptyAgenda ? (
					<div className="mt-3.5 rounded-lg border border-[color:var(--table-border)] bg-[color:var(--table-row-alt)] p-3">
						<p className="text-sm font-semibold text-foreground">
							Sem atividades próximas
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Os próximos compromissos aparecerão aqui automaticamente.
						</p>
					</div>
				) : null}

				{status === 'error' ? (
					<div
						className="mt-3.5 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
						role="alert"
					>
						Não foi possível carregar a agenda agora.
						<RetryAction onClick={onRetry}>Tentar novamente</RetryAction>
					</div>
				) : null}

				{status === 'ready' && items.length > 0 ? (
					<ul className="mt-3.5 space-y-3.5" aria-label="Atividades">
						{items.map((item) => (
							<li key={item.id} className="flex min-w-0 items-start gap-2.5">
								<div
									aria-hidden="true"
									className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--kpi-surface-brand)] text-[color:var(--kpi-icon-brand)]"
								>
									<CalendarDays className="size-4" strokeWidth={2.1} />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-[12.5px] leading-snug font-extrabold text-foreground">
										{item.title}
									</p>
									<p className="mt-0.5 text-[12px] text-muted-foreground">
										{formatItemTime(item)}
									</p>
									{item.location ? (
										<p className="mt-0.5 truncate text-[11px] text-muted-foreground">
											{item.location}
										</p>
									) : null}
								</div>
							</li>
						))}
					</ul>
				) : null}
			</CardContent>
		</Card>
	);
}

export { ImportantActivitiesCard };
export type { ImportantActivitiesViewStatus };
