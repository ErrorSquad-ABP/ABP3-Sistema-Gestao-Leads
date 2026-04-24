'use client';

import { Ellipsis, Flame, PencilLine, Snowflake, Sun, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Deal } from '@/features/deals/model/deals.model';
import {
	formatDealValueBrl,
	initialsFromName,
	mapImportanceUi,
} from '@/features/deals/lib/pipeline';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
	deal: Deal;
	showValues: boolean;
	onOpenDetails: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onDelete?: (deal: Deal) => void;
};

function NegotiationDealCard({
	deal,
	showValues,
	onOpenDetails,
	onEdit,
	onDelete,
}: Props) {
	const initials = initialsFromName(deal.leadCustomerName);
	const importance = mapImportanceUi(deal.importance);

	const ImportanceIcon =
		importance.label === 'Quente'
			? Flame
			: importance.label === 'Morna'
				? Sun
				: Snowflake;

	const badgeClassName =
		importance.label === 'Quente'
			? 'bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-accent)]'
			: importance.label === 'Morna'
				? 'bg-muted/60 text-foreground'
				: 'bg-muted/40 text-muted-foreground';

	return (
		<div className="w-full rounded-2xl border border-border bg-white p-[14px] text-left shadow-none transition-colors hover:bg-muted/10">
			<div className="flex items-start gap-[12px]">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/50 text-[11px] font-semibold text-foreground">
					{initials || '—'}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<button
							type="button"
							onClick={() => onOpenDetails(deal)}
							className="min-w-0 flex-1 text-left"
						>
							<p className="truncate text-[13px] font-semibold leading-5 text-foreground">
								{deal.leadCustomerName}
							</p>
							<p className="truncate text-[11px] leading-4 text-muted-foreground">
								{deal.vehicleLabel}
							</p>
						</button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="inline-flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/40"
									aria-label="Ações"
								>
									<Ellipsis className="size-4" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-44 rounded-2xl">
								<DropdownMenuItem
									className="cursor-pointer rounded-xl px-3 py-2 text-sm"
									onSelect={() => onOpenDetails(deal)}
								>
									Detalhes
								</DropdownMenuItem>
								<DropdownMenuItem
									disabled={!deal.canMutate || !onEdit}
									className="cursor-pointer rounded-xl px-3 py-2 text-sm"
									onSelect={() => onEdit?.(deal)}
								>
									<PencilLine className="size-4" />
									Editar
								</DropdownMenuItem>
								<DropdownMenuItem
									disabled={!deal.canMutate || !onDelete}
									className="cursor-pointer rounded-xl px-3 py-2 text-sm"
									onSelect={() => onDelete?.(deal)}
								>
									<Trash2 className="size-4" />
									Excluir
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div className="mt-[10px] flex items-center justify-between gap-3">
						<span
							className={cn(
								'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold leading-none',
								badgeClassName,
							)}
						>
							<ImportanceIcon className="size-3" />
							{importance.label}
						</span>
						<p className="text-[11px] font-semibold text-foreground">
							{showValues ? formatDealValueBrl(deal.value) : ''}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export { NegotiationDealCard };
