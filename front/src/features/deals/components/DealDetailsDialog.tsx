'use client';

import {
	Activity,
	Brain,
	Car,
	CircleCheck,
	CircleX,
	Clock,
	Flame,
	Flag,
	Handshake,
	History,
	Info,
	MessageSquareText,
	ScrollText,
	Snowflake,
	Sparkles,
	Star,
	SunMedium,
	Tag,
	User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/http/api-error';

import { useDealHistoryQuery } from '../hooks/deals.queries';
import {
	formatDealHistoryFieldName,
	formatDealHistoryValueDisplay,
	formatDealImportanceLabel,
	formatDealLeadCustomerDisplay,
	formatDealStageLabel,
	formatDealStatusLabel,
	formatDealValueBRL,
} from '../lib/deal-labels';
import type {
	Deal,
	DealImportance,
	DealStage,
	DealStatus,
} from '../model/deals.model';
import { DealVehicleLabelText } from './DealVehicleLabelText';

type DealDetailsDialogProps = {
	deal: Deal | null;
	onClose: () => void;
	open: boolean;
};

const labelIconClass =
	'size-4 shrink-0 text-[#9aa3b2] [.group-label:hover_&]:text-[#7a8494]';

function formatDateTime(value: Date) {
	return value.toLocaleString('pt-BR');
}

function getStatusBadgeVisual(status: DealStatus) {
	switch (status) {
		case 'OPEN':
			return {
				Icon: Activity,
				wrapClassName: 'border border-emerald-100 bg-emerald-50 text-emerald-700',
			};
		case 'WON':
			return {
				Icon: CircleCheck,
				wrapClassName: 'border border-teal-100 bg-teal-50 text-teal-700',
			};
		case 'LOST':
			return {
				Icon: CircleX,
				wrapClassName: 'border border-rose-100 bg-rose-50 text-rose-700',
			};
	}
}

function getImportanceBadgeVisual(importance: DealImportance) {
	switch (importance) {
		case 'HOT':
			return {
				Icon: Flame,
				wrapClassName:
					'border border-[color:var(--brand-accent)]/25 bg-[color:var(--brand-accent-soft)]/40 text-[color:var(--brand-accent)]',
			};
		case 'WARM':
			return {
				Icon: SunMedium,
				wrapClassName: 'border border-amber-100 bg-amber-50 text-amber-700',
			};
		case 'COLD':
			return {
				Icon: Snowflake,
				wrapClassName: 'border border-sky-100 bg-sky-50 text-sky-700',
			};
	}
}

function getStageBadgeVisual(stage: DealStage) {
	switch (stage) {
		case 'INITIAL_CONTACT':
			return {
				Icon: User,
				wrapClassName:
					'border border-[color:var(--brand-accent)]/25 bg-[color:var(--brand-accent-soft)]/40 text-[color:var(--brand-accent)]',
			};
		case 'NEGOTIATION':
			return {
				Icon: Handshake,
				wrapClassName:
					'border border-[color:var(--brand-accent)]/25 bg-[color:var(--brand-accent-soft)]/40 text-[color:var(--brand-accent)]',
			};
		case 'PROPOSAL':
			return {
				Icon: ScrollText,
				wrapClassName: 'border border-violet-100 bg-violet-50 text-violet-700',
			};
		case 'CLOSING':
			return {
				Icon: MessageSquareText,
				wrapClassName: 'border border-amber-100 bg-amber-50 text-amber-700',
			};
	}
}

const historyEventTitles: Record<string, string> = {
	STAGE: 'Etapa alterada',
	IMPORTANCE: 'Importância alterada',
	VEHICLE: 'Veículo alterado',
	STATUS: 'Status alterado',
	TITLE: 'Título alterado',
	VALUE: 'Valor alterado',
};

function getHistoryEventTitle(field: string): string {
	const k = field.trim().toUpperCase();
	return (
		historyEventTitles[k] ?? `${formatDealHistoryFieldName(field)} alterado`
	);
}

function getHistoryTimelineVisual(field: string) {
	switch (field.trim().toUpperCase()) {
		case 'STAGE':
			return {
				Icon: Flag,
				wrapClassName:
					'bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)] ring-4 ring-white',
			};
		case 'IMPORTANCE':
			return {
				Icon: Flame,
				wrapClassName:
					'bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)] ring-4 ring-white',
			};
		case 'VEHICLE':
			return {
				Icon: Car,
				wrapClassName: 'bg-sky-50 text-sky-600 ring-4 ring-white',
			};
		case 'STATUS':
			return {
				Icon: Activity,
				wrapClassName: 'bg-emerald-50 text-emerald-600 ring-4 ring-white',
			};
		case 'TITLE':
			return {
				Icon: Tag,
				wrapClassName: 'bg-muted text-muted-foreground ring-4 ring-white',
			};
		case 'VALUE':
			return {
				Icon: Sparkles,
				wrapClassName: 'bg-amber-50 text-amber-700 ring-4 ring-white',
			};
		default:
			return {
				Icon: History,
				wrapClassName: 'bg-muted text-muted-foreground ring-4 ring-white',
			};
	}
}

type DetailSlotProps = {
	label: string;
	labelIcon?: ReactNode;
	children: ReactNode;
	className?: string;
};

function DetailSlot({
	label,
	labelIcon,
	children,
	className,
}: DetailSlotProps) {
	return (
		<div className={className}>
			<div className="group-label flex items-center gap-2 text-[11.5px] font-semibold text-[#7a8494]">
				{labelIcon}
				<span>{label}</span>
			</div>
			<div className="mt-2 min-w-0">{children}</div>
		</div>
	);
}

function DealDetailsDialog({ deal, onClose, open }: DealDetailsDialogProps) {
	const dealId = deal?.id ?? '';
	const historyQuery = useDealHistoryQuery(dealId, {
		enabled: open && Boolean(dealId),
	});
	const history = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

	if (!deal) {
		return null;
	}

	const statusBadge = getStatusBadgeVisual(deal.status);
	const importanceBadge = getImportanceBadgeVisual(deal.importance);
	const stageBadge = getStageBadgeVisual(deal.stage);
	const StatusIcon = statusBadge.Icon;
	const ImportanceIcon = importanceBadge.Icon;
	const StageIcon = stageBadge.Icon;

	return (
		<Dialog
			onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
			open={open}
		>
			<DialogContent className="max-h-[min(92vh,800px)] max-w-4xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[18px] border-[#e7ebf0] p-0 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
				<DialogHeader className="flex-row items-start gap-4 px-8 py-6">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-accent-soft)]/45 text-[color:var(--brand-accent)]">
						<Info className="size-6" />
					</div>
					<div className="min-w-0 space-y-1">
						<p className="text-[0.68rem] font-bold uppercase tracking-[0.35em] text-[color:var(--brand-accent)]">
							Negociações
						</p>
						<DialogTitle className="text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-[#1b2430]">
							Detalhes da negociação
						</DialogTitle>
						<DialogDescription className="text-[13px] leading-5 text-[#7a8494]">
							Consulte dados principais e o histórico de alterações.
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className="min-h-0 overflow-y-auto px-8 pb-2 pt-2 sm:pb-4">
					<div className="space-y-4">
						<div className="rounded-xl border border-[#e7ebf0] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
							<div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8">
								<DetailSlot
									label="Status"
									labelIcon={<Sparkles className={labelIconClass} />}
								>
									<span
										className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusBadge.wrapClassName}`}
									>
										<StatusIcon className="size-3.5" />
										{formatDealStatusLabel(deal.status)}
									</span>
								</DetailSlot>

								<DetailSlot
									label="Etapa"
									labelIcon={<Flag className={labelIconClass} />}
								>
									<span
										className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${stageBadge.wrapClassName}`}
									>
										<StageIcon className="size-3.5" />
										{formatDealStageLabel(deal.stage)}
									</span>
								</DetailSlot>

								<DetailSlot
									label="Importância"
									labelIcon={<Brain className={labelIconClass} />}
								>
									<span
										className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${importanceBadge.wrapClassName}`}
									>
										<ImportanceIcon className="size-3.5" />
										{formatDealImportanceLabel(deal.importance)}
									</span>
								</DetailSlot>

								<DetailSlot
									label="Valor"
									labelIcon={<Star className={labelIconClass} />}
								>
									<p className="text-[13px] font-semibold tabular-nums text-[#1b2430]">
										{formatDealValueBRL(deal.value)}
									</p>
								</DetailSlot>

								<DetailSlot
									className="sm:col-span-2"
									label="Título"
									labelIcon={<Tag className={labelIconClass} />}
								>
									<div className="flex items-start gap-2 text-[13px] font-medium leading-snug text-[#1b2430]">
										<Tag className="mt-0.5 size-4 shrink-0 text-[#9aa3b2]" aria-hidden />
										<span className="break-words">{deal.title}</span>
									</div>
								</DetailSlot>

								<DetailSlot
									label="Lead"
									labelIcon={<Flag className={labelIconClass} />}
								>
									<div className="flex items-start gap-2 text-[13px] font-medium text-[#1b2430]">
										<User className="mt-0.5 size-4 shrink-0 text-[#9aa3b2]" aria-hidden />
										<span>
											{formatDealLeadCustomerDisplay(deal.leadCustomerName ?? '')}
										</span>
									</div>
								</DetailSlot>

								<DetailSlot
									label="Veículo"
									labelIcon={<Car className={labelIconClass} />}
								>
									<div className="flex items-start gap-2 text-[13px] font-medium text-[#1b2430]">
										<Car className="mt-0.5 size-4 shrink-0 text-[#9aa3b2]" aria-hidden />
										<span className="break-words">
											<DealVehicleLabelText
												serverLabel={deal.vehicleLabel}
												vehicleId={deal.vehicleId}
											/>
										</span>
									</div>
								</DetailSlot>

								<DetailSlot
									label="Criado em"
									labelIcon={<Clock className={labelIconClass} />}
								>
									<p className="text-[13px] font-medium text-[#1b2430]">
										{formatDateTime(deal.createdAt)}
									</p>
								</DetailSlot>

								<DetailSlot
									label="Atualizado em"
									labelIcon={<Clock className={labelIconClass} />}
								>
									<p className="text-[13px] font-medium text-[#1b2430]">
										{formatDateTime(deal.updatedAt)}
									</p>
								</DetailSlot>
							</div>
						</div>

						<div className="rounded-xl border border-[#e7ebf0] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
							<div className="flex items-start gap-3">
								<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-accent-soft)]/40 text-[color:var(--brand-accent)]">
									<History className="size-4" />
								</span>
								<div className="min-w-0">
									<h3 className="text-[15px] font-bold text-[#1b2430]">
										Histórico
									</h3>
									<p className="mt-0.5 text-[12px] leading-4 text-[#7a8494]">
										Acompanhe as principais alterações realizadas nesta negociação.
									</p>
								</div>
							</div>

							<div className="mt-5">
								{historyQuery.isPending ? (
									<div className="space-y-2">
										<Skeleton className="h-[72px] w-full rounded-xl" />
										<Skeleton className="h-[72px] w-full rounded-xl" />
										<Skeleton className="h-[72px] w-full rounded-xl" />
									</div>
								) : null}

								{historyQuery.isError ? (
									<div
										className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
										role="alert"
									>
										{historyQuery.error instanceof ApiError
											? historyQuery.error.message
											: 'Não foi possível carregar o histórico da negociação.'}
									</div>
								) : null}

								{historyQuery.isSuccess ? (
									<>
										{history.length === 0 ? (
											<div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-10 text-center text-[13px] text-[#7a8494]">
												Nenhuma alteração registrada.
											</div>
										) : (
											<ul className="space-y-4">
												{history.map((item, index) => {
													const visual = getHistoryTimelineVisual(item.field);
													const HistIcon = visual.Icon;
													const detailLineParts: string[] = [];
													if (
														item.fromValue != null &&
														item.fromValue !== ''
													) {
														detailLineParts.push(
															`De: ${formatDealHistoryValueDisplay(
																item.field,
																item.fromValue,
															)}`,
														);
													}
													detailLineParts.push(
														`Para: ${formatDealHistoryValueDisplay(
															item.field,
															item.toValue,
														)}`,
													);
													const connector =
														index < history.length - 1 ? (
															<div
																aria-hidden
																className="mx-auto mt-1 min-h-4 w-px shrink-0 bg-[#dfe4eb]"
															/>
														) : null;
													return (
														<li
															className="flex gap-3"
															key={item.id}
														>
															<div className="flex w-11 shrink-0 flex-col items-center pt-1">
																<span
																	className={`flex size-9 items-center justify-center rounded-full ${visual.wrapClassName}`}
																>
																	<HistIcon className="size-4" aria-hidden />
																</span>
																{connector}
															</div>
															<div className="min-w-0 flex-1 rounded-xl border border-[#e7ebf0] bg-[#fdfefe] px-4 py-3">
																<p className="text-[13px] font-semibold text-[#1b2430]">
																	{getHistoryEventTitle(item.field)}
																</p>
																<p className="mt-1 text-[12.5px] leading-[1.35] text-[#5c6570]">
																	{detailLineParts.join(' · ')}
																</p>
																<p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#7a8494]">
																	<Clock className="size-3 shrink-0" aria-hidden />
																	<span>{formatDateTime(item.createdAt)}</span>
																</p>
															</div>
														</li>
													);
												})}
											</ul>
										)}
									</>
								) : null}
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="shrink-0 justify-end gap-2 border-t border-[#eef1f5] px-8 py-4">
					<Button
						className="h-10 rounded-xl px-5 font-semibold shadow-none"
						onClick={onClose}
						type="button"
						variant="outline"
					>
						Fechar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { DealDetailsDialog };
