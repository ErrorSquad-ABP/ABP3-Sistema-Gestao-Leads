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

import type { AnalyticDashboard } from '../model/analytic-dashboard.model';

type LeadOutcome = NonNullable<
	AnalyticDashboard['drillDown']['conversionLeads'][number]['outcome']
>;

const DEFAULT_OUTCOME: LeadOutcome = 'open';

const OUTCOME_LABELS = new Map<LeadOutcome, string>([
	['converted', 'Convertido'],
	['lost', 'Perdido'],
	['open', 'Em andamento'],
]);

const OUTCOME_COLORS = new Map<LeadOutcome, string>([
	['converted', CHART_COLORS.performanceOk],
	['lost', CHART_COLORS.performanceBelow],
	['open', CHART_COLORS.neutral],
]);

function formatCount(value: number) {
	return new Intl.NumberFormat('pt-BR').format(value);
}

function getOutcomeLabel(outcome: LeadOutcome) {
	return OUTCOME_LABELS.get(outcome) ?? 'Em andamento';
}

function getOutcomeColor(outcome: LeadOutcome) {
	return OUTCOME_COLORS.get(outcome) ?? CHART_COLORS.neutral;
}

type AnalyticConversionDetailDialogProps = {
	readonly dashboard: AnalyticDashboard | undefined;
	readonly onOpenChange: (open: boolean) => void;
	readonly open: boolean;
};

function AnalyticConversionDetailDialog({
	dashboard,
	onOpenChange,
	open,
}: AnalyticConversionDetailDialogProps) {
	const leads = dashboard?.drillDown.conversionLeads ?? [];
	const summary = dashboard?.summary;

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="flex max-h-[84vh] max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card p-0">
				<DialogHeader className="gap-2 border-b border-border px-6 py-5">
					<DialogTitle>Detalhes da conversão</DialogTitle>
					<DialogDescription>
						Resumo de convertidos, perdidos e em andamento com atalhos para a
						gestão de leads.
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
					{summary ? (
						<div className="mb-4 grid gap-3 sm:grid-cols-3">
							<div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
								<p className="text-xs font-medium text-muted-foreground">
									Convertidos
								</p>
								<p
									className="mt-1 text-xl font-semibold"
									style={{ color: getOutcomeColor('converted') }}
								>
									{formatCount(summary.convertedLeads)}
								</p>
							</div>
							<div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
								<p className="text-xs font-medium text-muted-foreground">
									Perdidos
								</p>
								<p
									className="mt-1 text-xl font-semibold"
									style={{ color: getOutcomeColor('lost') }}
								>
									{formatCount(summary.lostLeads ?? 0)}
								</p>
							</div>
							<div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
								<p className="text-xs font-medium text-muted-foreground">
									Em andamento
								</p>
								<p
									className="mt-1 text-xl font-semibold"
									style={{ color: getOutcomeColor('open') }}
								>
									{formatCount(summary.notConvertedLeads)}
								</p>
							</div>
						</div>
					) : null}

					{leads.length > 0 ? (
						<ul className="divide-y divide-border rounded-2xl border border-border">
							{leads.map((lead) => {
								const outcome = lead.outcome ?? DEFAULT_OUTCOME;
								const outcomeColor = getOutcomeColor(outcome);
								const outcomeLabel = getOutcomeLabel(outcome);
								return (
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
													{outcomeLabel}
												</p>
											</div>
											<span
												className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
												style={{
													backgroundColor: `${outcomeColor}22`,
													color: outcomeColor,
												}}
											>
												{outcomeLabel}
												<ArrowUpRight className="size-3" />
											</span>
										</Link>
									</li>
								);
							})}
						</ul>
					) : (
						<p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
							Nenhum lead encontrado no período selecionado.
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { AnalyticConversionDetailDialog };
