'use client';

import { ArrowDownUp, ChevronDown, SlidersHorizontal } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
	DealImportance,
	DealPipelineSortMode,
	DealStatus,
} from '@/features/deals/model/deals.model';
import { cn } from '@/lib/utils';

type ImportanceFilter = 'ALL' | DealImportance;
type StatusFilter = 'ALL' | DealStatus;

type Props = {
	importanceFilter: ImportanceFilter;
	statusFilter: StatusFilter;
	showValues: boolean;
	onImportanceFilterChange: (next: ImportanceFilter) => void;
	onStatusFilterChange: (next: StatusFilter) => void;
	pipelineSortMode: DealPipelineSortMode;
	onPipelineSortModeChange: (next: DealPipelineSortMode) => void;
	onShowValuesChange: (next: boolean) => void;
};

const IMPORTANCE_OPTIONS: { label: string; value: ImportanceFilter }[] = [
	{ label: 'Todas', value: 'ALL' },
	{ label: 'Fria', value: 'COLD' },
	{ label: 'Morna', value: 'WARM' },
	{ label: 'Quente', value: 'HOT' },
];

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
	{ label: 'Todos', value: 'ALL' },
	{ label: 'Abertas', value: 'OPEN' },
	{ label: 'Ganhas', value: 'WON' },
	{ label: 'Perdidas', value: 'LOST' },
];

function getImportanceLabel(value: ImportanceFilter) {
	return (
		IMPORTANCE_OPTIONS.find((option) => option.value === value)?.label ??
		'Todas'
	);
}

function getStatusLabel(value: StatusFilter) {
	return (
		STATUS_OPTIONS.find((option) => option.value === value)?.label ?? 'Todos'
	);
}

const SORT_OPTIONS: { label: string; value: DealPipelineSortMode }[] = [
	{ label: 'Mais recentes', value: 'recent' },
	{ label: 'Valor crescente', value: 'value_asc' },
	{ label: 'Valor decrescente', value: 'value_desc' },
];

function getPipelineSortTriggerLabel(mode: DealPipelineSortMode) {
	return (
		SORT_OPTIONS.find((option) => option.value === mode)?.label ??
		'Mais recentes'
	);
}

function PipelineControls({
	importanceFilter,
	statusFilter,
	showValues,
	onImportanceFilterChange,
	onStatusFilterChange,
	pipelineSortMode,
	onPipelineSortModeChange,
	onShowValuesChange,
}: Props) {
	return (
		<div className="flex items-center gap-[10px] pt-0.5">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className={cn(
							'inline-flex h-9 items-center gap-2 rounded-[9px] border border-border bg-white px-[13px] text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.025)] hover:bg-muted/30',
							statusFilter !== 'ALL' &&
								'border-[color:var(--brand-accent)]/40 bg-[color:var(--brand-accent-soft)]/25 text-[color:var(--brand-accent)]',
						)}
					>
						<SlidersHorizontal className="size-4 text-muted-foreground" />
						Status: {getStatusLabel(statusFilter)}
						<ChevronDown className="size-4 text-muted-foreground" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-44 rounded-lg border border-border bg-white p-1 text-foreground shadow-lg"
				>
					<DropdownMenuRadioGroup
						value={statusFilter}
						onValueChange={(value) =>
							onStatusFilterChange(value as StatusFilter)
						}
					>
						{STATUS_OPTIONS.map((option) => (
							<DropdownMenuRadioItem
								key={option.value}
								value={option.value}
								className="rounded-md text-[13px]"
							>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className={cn(
							'inline-flex h-9 items-center gap-2 rounded-[9px] border border-border bg-white px-[13px] text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.025)] hover:bg-muted/30',
							importanceFilter !== 'ALL' &&
								'border-[color:var(--brand-accent)]/40 bg-[color:var(--brand-accent-soft)]/25 text-[color:var(--brand-accent)]',
						)}
					>
						<SlidersHorizontal className="size-4 text-muted-foreground" />
						Importância: {getImportanceLabel(importanceFilter)}
						<ChevronDown className="size-4 text-muted-foreground" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-44 rounded-lg border border-border bg-white p-1 text-foreground shadow-lg"
				>
					<DropdownMenuRadioGroup
						value={importanceFilter}
						onValueChange={(value) =>
							onImportanceFilterChange(value as ImportanceFilter)
						}
					>
						{IMPORTANCE_OPTIONS.map((option) => (
							<DropdownMenuRadioItem
								key={option.value}
								value={option.value}
								className="rounded-md text-[13px]"
							>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className={cn(
							'inline-flex h-9 max-w-[min(100%,220px)] items-center gap-2 rounded-[9px] border border-border bg-white px-[13px] text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.025)] hover:bg-muted/30',
							pipelineSortMode !== 'recent' &&
								'border-[color:var(--brand-accent)]/40 bg-[color:var(--brand-accent-soft)]/25 text-[color:var(--brand-accent)]',
						)}
					>
						<ArrowDownUp className="size-4 shrink-0 text-muted-foreground" />
						<span className="min-w-0 truncate">
							Ordem: {getPipelineSortTriggerLabel(pipelineSortMode)}
						</span>
						<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-[min(96vw,15rem)] rounded-lg border border-border bg-white p-1 text-foreground shadow-lg"
				>
					<DropdownMenuRadioGroup
						value={pipelineSortMode}
						onValueChange={(value) =>
							onPipelineSortModeChange(value as DealPipelineSortMode)
						}
					>
						{SORT_OPTIONS.map((option) => (
							<DropdownMenuRadioItem
								key={option.value}
								value={option.value}
								className="rounded-md text-[13px]"
							>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<button
				type="button"
				onClick={() => onShowValuesChange(!showValues)}
				role="switch"
				aria-checked={showValues}
				className={cn(
					'inline-flex h-9 items-center gap-2 rounded-[9px] border border-border bg-white px-[13px] text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.025)] hover:bg-muted/30',
				)}
			>
				<span className="text-[13px] text-muted-foreground">
					Exibir valores
				</span>
				<span
					aria-hidden="true"
					className={cn(
						'relative ml-[3px] inline-flex h-[18px] w-[32px] shrink-0 items-center rounded-full transition-colors',
						showValues ? 'bg-[color:var(--brand-accent)]' : 'bg-muted/40',
					)}
				>
					<span
						className={cn(
							'absolute left-0.5 top-1/2 block size-[14px] -translate-y-1/2 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.18)] transition-transform',
							showValues ? 'translate-x-[14px]' : 'translate-x-0',
						)}
					/>
				</span>
			</button>
		</div>
	);
}

export { PipelineControls };
