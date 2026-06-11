'use client';

import { ArrowDownUp, ChevronDown, SlidersHorizontal } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type AppTableFilterOption = {
	label: string;
	value: string;
};

type AppTableFilterDropdownProps = {
	ariaLabel?: string;
	className?: string;
	defaultValue?: string;
	kind?: 'filter' | 'sort';
	label: string;
	onValueChange: (value: string) => void;
	options: readonly AppTableFilterOption[];
	value: string;
};

function AppTableFilterDropdown({
	ariaLabel,
	className,
	defaultValue,
	kind = 'filter',
	label,
	onValueChange,
	options,
	value,
}: AppTableFilterDropdownProps) {
	const selectedLabel =
		value === defaultValue
			? label
			: (options.find((option) => option.value === value)?.label ??
				label);
	const Icon = kind === 'sort' ? ArrowDownUp : SlidersHorizontal;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					aria-label={`${ariaLabel ?? label}: ${selectedLabel}`}
					className={cn(
						'inline-flex h-9 w-40 max-w-full items-center gap-2 rounded-[9px] border border-border bg-white px-[13px] text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.025)] hover:bg-muted/30',
						className,
					)}
					type="button"
				>
					<Icon className="size-4 shrink-0 text-muted-foreground" />
					<span className="min-w-0 flex-1 truncate text-left">
						{selectedLabel}
					</span>
					<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[min(96vw,15rem)] rounded-lg border border-border bg-white p-1 text-foreground shadow-lg"
			>
				<DropdownMenuRadioGroup
					onValueChange={onValueChange}
					value={value}
				>
					{options.map((option) => (
						<DropdownMenuRadioItem
							className="rounded-md text-[13px]"
							key={option.value}
							value={option.value}
						>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { AppTableFilterDropdown };
export type { AppTableFilterOption };
