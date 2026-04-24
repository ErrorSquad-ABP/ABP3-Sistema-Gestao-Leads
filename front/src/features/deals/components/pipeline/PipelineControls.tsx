'use client';

import { ChevronDown, Ellipsis, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
	showValues: boolean;
	onShowValuesChange: (next: boolean) => void;
};

function PipelineControls({ showValues, onShowValuesChange }: Props) {
	return (
		<div className="flex items-center gap-[10px] pt-0.5">
			<button
				type="button"
				className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-border bg-white px-[13px] text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.025)] hover:bg-muted/30"
			>
				<SlidersHorizontal className="size-4 text-muted-foreground" />
				Importância
				<ChevronDown className="size-4 text-muted-foreground" />
			</button>

			<button
				type="button"
				onClick={() => onShowValuesChange(!showValues)}
				className={cn(
					'inline-flex h-9 items-center gap-2 rounded-[9px] border border-border bg-white px-[13px] text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.025)] hover:bg-muted/30',
				)}
			>
				<span className="text-[13px] text-muted-foreground">Exibir valores</span>
				<span
					aria-hidden="true"
					className={cn(
						'relative ml-[3px] h-4 w-[27px] rounded-full transition-colors',
						showValues ? 'bg-[color:var(--brand-accent)]' : 'bg-muted/40',
					)}
				>
					<span
						className={cn(
							'absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform',
							showValues ? 'translate-x-[13px]' : 'translate-x-0.5',
						)}
					/>
				</span>
			</button>

			<Button
				variant="outline"
				size="icon-sm"
				className="h-9 w-9 rounded-[9px] bg-white text-muted-foreground shadow-none"
				aria-label="Mais opções"
			>
				<Ellipsis className="size-4 text-muted-foreground" />
			</Button>
		</div>
	);
}

export { PipelineControls };
