'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { CHART_COLORS } from '@/lib/charts/chart-colors';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import type { AnalyticDashboard } from '../model/analytic-dashboard.model';

const IMPORTANCE_LABELS = new Map([
	['COLD', 'Fria'],
	['WARM', 'Morna'],
	['HOT', 'Quente'],
]);

function importanceColor(key: string | undefined): string {
	switch (key) {
		case 'COLD':
			return CHART_COLORS.cold;
		case 'WARM':
			return CHART_COLORS.warm;
		case 'HOT':
			return CHART_COLORS.hot;
		default:
			return CHART_COLORS.neutral;
	}
}

function importanceLabel(key: string | undefined): string {
	if (!key) return 'Sem classificação';
	return IMPORTANCE_LABELS.get(key) ?? key;
}

type AnalyticImportanceDetailDialogProps = {
	readonly dashboard: AnalyticDashboard | undefined;
	readonly onOpenChange: (open: boolean) => void;
	readonly open: boolean;
};

function AnalyticImportanceDetailDialog({
	dashboard,
	onOpenChange,
	open,
}: AnalyticImportanceDetailDialogProps) {
	const leads = dashboard?.drillDown.importanceLeads ?? [];
	const distribution = dashboard?.importanceDistribution ?? [];

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="flex max-h-[84vh] max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card p-0">
				<DialogHeader className="gap-2 border-b border-border px-6 py-5">
					<DialogTitle>Detalhes da importância</DialogTitle>
					<DialogDescription>
						Leads do período agrupados pela classificação de importância da
						negociação.
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
					{distribution.length > 0 ? (
						<div className="mb-4 flex flex-wrap gap-2">
							{distribution.map((item) => (
								<span
									className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
									key={item.key}
								>
									<span
										aria-hidden="true"
										className="size-2 rounded-full"
										style={{ backgroundColor: importanceColor(item.key) }}
									/>
									{item.label}: {item.count}
								</span>
							))}
						</div>
					) : null}

					{leads.length > 0 ? (
						<ul className="divide-y divide-border rounded-2xl border border-border">
							{leads.map((lead) => (
								<li key={lead.id}>
									<Link
										className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-muted/40"
										href={`${appRoutes.app.leads}/${lead.id}`}
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-foreground">
												{lead.label}
											</p>
											<p className="mt-0.5 text-xs text-muted-foreground">
												Classificação: {importanceLabel(lead.importance)}
											</p>
										</div>
										<span
											className={cn(
												'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
											)}
											style={{
												backgroundColor: `${importanceColor(lead.importance)}22`,
												color: importanceColor(lead.importance),
											}}
										>
											{importanceLabel(lead.importance)}
											<ArrowUpRight className="size-3" />
										</span>
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
							Nenhum lead com negociação classificada no período selecionado.
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { AnalyticImportanceDetailDialog };
