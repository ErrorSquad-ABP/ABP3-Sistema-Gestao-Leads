'use client';

import { Clock, History, Info } from 'lucide-react';
import { useMemo } from 'react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/http/api-error';

import { useDealHistoryQuery } from '../hooks/deals.queries';
import {
	formatDealImportanceLabel,
	formatDealStageLabel,
	formatDealStatusLabel,
	formatDealValueBRL,
} from '../lib/deal-labels';
import type { Deal } from '../model/deals.model';

type DealDetailsDialogProps = {
	deal: Deal | null;
	onClose: () => void;
	open: boolean;
};

function formatDateTime(value: Date) {
	return value.toLocaleString('pt-BR');
}

function DealDetailsDialog({ deal, onClose, open }: DealDetailsDialogProps) {
	const dealId = deal?.id ?? '';
	const historyQuery = useDealHistoryQuery(dealId);
	const history = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

	if (!deal) {
		return null;
	}

	return (
		<Dialog
			onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
			open={open}
		>
			<DialogContent className="flex max-h-[84vh] max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-[#d8e0ea] bg-white">
				<DialogHeader className="gap-3 border-b border-[#e5ebf3] px-8 py-7">
					<div className="flex items-center gap-4">
						<div className="flex size-13 items-center justify-center rounded-2xl border border-[#d96c3f]/15 bg-[#d96c3f]/10 text-[#d96c3f]">
							<Info className="size-6" />
						</div>
						<div className="space-y-1">
							<p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d96c3f]">
								Negociações
							</p>
							<DialogTitle>Detalhes da negociação</DialogTitle>
							<DialogDescription className="max-w-2xl">
								Consulte dados principais e o histórico de alterações.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-8 pb-8 pt-7">
					<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
						<div className="grid gap-4 text-sm md:grid-cols-2">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									Status
								</p>
								<p className="mt-1 text-[#1b2430]">
									{formatDealStatusLabel(deal.status)}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									Etapa
								</p>
								<p className="mt-1 text-[#1b2430]">
									{formatDealStageLabel(deal.stage)}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									Importância
								</p>
								<p className="mt-1 text-[#1b2430]">
									{formatDealImportanceLabel(deal.importance)}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									Valor
								</p>
								<p className="mt-1 text-[#1b2430]">
									{formatDealValueBRL(deal.value)}
								</p>
							</div>
							<div className="md:col-span-2">
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									Título
								</p>
								<p className="mt-1 text-[#1b2430]">{deal.title}</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									Lead
								</p>
								<p className="mt-1 text-[#1b2430]">
									{deal.leadCustomerName || 'Cliente não encontrado'}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									Veículo
								</p>
								<p className="mt-1 text-[#1b2430]">
									{deal.vehicleLabel || 'Veículo não encontrado'}
								</p>
							</div>
							<div>
								<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									<Clock className="size-3.5" />
									Criado em
								</p>
								<p className="mt-1 text-[#1b2430]">
									{formatDateTime(deal.createdAt)}
								</p>
							</div>
							<div>
								<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7687]">
									<Clock className="size-3.5" />
									Atualizado em
								</p>
								<p className="mt-1 text-[#1b2430]">
									{formatDateTime(deal.updatedAt)}
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-3xl border border-[#e5ebf3] bg-white p-5">
						<div className="flex items-center gap-2 text-sm font-semibold text-[#1b2430]">
							<History className="size-4 text-[#d96c3f]" />
							Histórico
						</div>

						{historyQuery.isPending ? (
							<div className="mt-4 space-y-2">
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-full" />
							</div>
						) : null}

						{historyQuery.isError ? (
							<div
								className="mt-4 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
								role="alert"
							>
								{historyQuery.error instanceof ApiError
									? historyQuery.error.message
									: 'Não foi possível carregar o histórico da negociação.'}
							</div>
						) : null}

						{historyQuery.isSuccess ? (
							<div className="mt-4 space-y-3">
								{history.length === 0 ? (
									<div className="rounded-2xl border border-border/80 bg-card px-4 py-8 text-center text-sm text-[#6b7687]">
										Nenhuma alteração registrada.
									</div>
								) : (
									history.map((item) => (
										<div
											className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card px-4 py-3 text-sm"
											key={item.id}
										>
											<p className="font-medium text-[#1b2430]">{item.field}</p>
											<p className="text-[#6b7687]">
												{item.fromValue ? `De: ${item.fromValue} · ` : ''}Para:{' '}
												{item.toValue}
											</p>
											<p className="text-xs text-[#6b7687]">
												{formatDateTime(item.createdAt)}
											</p>
										</div>
									))
								)}
							</div>
						) : null}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { DealDetailsDialog };
