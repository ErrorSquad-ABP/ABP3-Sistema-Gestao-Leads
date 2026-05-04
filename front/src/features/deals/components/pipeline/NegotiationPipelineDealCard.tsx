'use client';

import {
	Activity,
	CircleCheck,
	CircleX,
	Flame,
	PencilLine,
	Snowflake,
	SunMedium,
	Trash2,
} from 'lucide-react';
import type { DragEvent } from 'react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Deal } from '@/features/deals/model/deals.model';
import { formatDealLeadOwnerDisplay } from '@/features/deals/lib/deal-labels';
import {
	formatDealValueBrl,
	initialsFromName,
	mapDealStatusUi,
	mapImportanceUi,
} from '@/features/deals/lib/pipeline';
import { cn } from '@/lib/utils';

type Props = {
	deal: Deal;
	showValues: boolean;
	onOpenDetails: (deal: Deal) => void;
	onEdit?: (deal: Deal) => void;
	onDelete?: (deal: Deal) => void;
	draggable?: boolean;
	isDragging?: boolean;
	isStageUpdating?: boolean;
	onDragStart?: (deal: Deal) => void;
	onDragEnd?: () => void;
};

function NegotiationPipelineDealCard({
	deal,
	showValues,
	onOpenDetails,
	onEdit,
	onDelete,
	draggable = false,
	isDragging = false,
	isStageUpdating = false,
	onDragStart,
	onDragEnd,
}: Props) {
	const initials = initialsFromName(deal.leadCustomerName);
	const importance = mapImportanceUi(deal.importance);
	const statusUi = mapDealStatusUi(deal.status);
	const StatusIcon =
		deal.status === 'OPEN'
			? Activity
			: deal.status === 'WON'
				? CircleCheck
				: CircleX;
	const ImportanceIcon =
		importance.label === 'Quente'
			? Flame
			: importance.label === 'Morna'
				? SunMedium
				: Snowflake;

	const badgeClassName =
		importance.label === 'Quente'
			? 'bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-accent)]'
			: importance.label === 'Morna'
				? 'bg-[color:var(--brand-accent-soft)]/55 text-[color:var(--brand-accent)]'
				: 'bg-muted/50 text-muted-foreground';

	function handleDragStart(event: DragEvent<HTMLDivElement>) {
		if (!draggable) {
			event.preventDefault();
			return;
		}
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', deal.id);
		onDragStart?.(deal);
	}

	return (
		<div
			draggable={draggable}
			onDragStart={handleDragStart}
			onDragEnd={onDragEnd}
			className={cn(
				'grid min-h-[132px] auto-rows-min grid-cols-[34px_minmax(0,1fr)_18px] grid-rows-[auto_1fr_auto] gap-x-[10px] overflow-hidden rounded-[11px] border border-border bg-white px-[13px] pb-[11px] pt-[14px] shadow-[0_2px_5px_rgba(15,23,42,0.025)] transition-all duration-200 ease-out',
				draggable ? 'cursor-grab active:cursor-grabbing' : '',
				isDragging ? 'scale-[1.02] cursor-grabbing opacity-60 shadow-lg' : '',
				isStageUpdating ? 'pointer-events-none opacity-50' : '',
			)}
		>
			<button
				type="button"
				onClick={() => onOpenDetails(deal)}
				className="row-span-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-[12px] font-bold text-muted-foreground"
			>
				{initials || '—'}
			</button>

			<button
				type="button"
				onClick={() => onOpenDetails(deal)}
				className="min-w-0 text-left"
			>
				<p className="mb-[3px] truncate text-[13px] font-extrabold leading-[15px] text-foreground">
					{deal.leadCustomerName}
				</p>
				<p className="truncate text-[12px] leading-[14px] text-muted-foreground">
					{deal.vehicleLabel}
				</p>
				<p
					className="mt-[4px] truncate text-[11px] font-semibold leading-[13px] text-muted-foreground"
					title={formatDealLeadOwnerDisplay(deal.leadOwnerName)}
				>
					{formatDealLeadOwnerDisplay(deal.leadOwnerName)}
				</p>
			</button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="pt-px text-right text-[14px] font-black leading-[10px] tracking-[1.4px] text-foreground hover:text-muted-foreground"
						aria-label="Ações"
					>
						•••
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
						disabled={!onEdit}
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

			<div className="col-span-3 flex min-w-0 flex-wrap items-end justify-between gap-x-2 gap-y-1.5 self-end">
				<div className="flex min-w-0 max-w-full flex-wrap items-center gap-1">
					<span
						className={cn(
							'inline-flex h-[22px] shrink-0 items-center gap-1 rounded-md px-2 text-[10.8px] font-bold leading-none',
							badgeClassName,
						)}
					>
						<ImportanceIcon className="size-3" />
						{importance.label}
					</span>
					<span
						className={cn(
							'inline-flex h-[22px] max-w-full shrink items-center gap-1 truncate rounded-md px-2 text-[10.5px] font-bold leading-none',
							statusUi.badgeClassName,
						)}
						title={statusUi.label}
					>
						<StatusIcon className="size-3 shrink-0" aria-hidden />
						{statusUi.label}
					</span>
				</div>
				<span className="ml-auto max-w-[98px] shrink-0 truncate text-right text-[12px] font-extrabold leading-4 text-foreground">
					{showValues ? formatDealValueBrl(deal.value) : ''}
				</span>
			</div>
		</div>
	);
}

export { NegotiationPipelineDealCard };
