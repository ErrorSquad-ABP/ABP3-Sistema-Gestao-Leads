import { CalendarDays } from 'lucide-react';

function AgendaEmptyState() {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center">
			<div className="flex size-12 items-center justify-center rounded-full bg-[color:var(--kpi-surface-brand)] text-[color:var(--kpi-icon-brand)]">
				<CalendarDays className="size-5" />
			</div>
			<h2 className="mt-4 text-base font-semibold text-foreground">
				Sem atividades próximas
			</h2>
			<p className="mt-2 max-w-sm text-sm text-muted-foreground">
				Os próximos compromissos aparecerão aqui automaticamente.
			</p>
		</div>
	);
}

export { AgendaEmptyState };
