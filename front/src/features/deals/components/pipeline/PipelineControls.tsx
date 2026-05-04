'use client';

import { ArrowDownUp, ChevronDown, SlidersHorizontal } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	dealImportanceOptions,
	dealPipelineFilterImportanceAllLabel,
	dealPipelineFilterImportanceLegendLabel,
	dealPipelineFilterStatusAllLabel,
	dealPipelineFilterStatusLegendLabel,
	dealPipelineSortLegendLabel,
	getDealPipelineFilterStatusOptionLabel,
	getDealPipelineSortDropdownLabel,
} from '@/features/deals/lib/deal-labels';
import {
	getPipelineImportanceFilterTriggerAccentClass,
	getPipelineSortFilterTriggerAccentClass,
	getPipelineStatusFilterTriggerAccentClass,
} from '@/features/deals/lib/pipeline';
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
	{ label: dealPipelineFilterImportanceAllLabel, value: 'ALL' },
	...dealImportanceOptions.map((option) => ({
		label: option.label,
		value: option.value,
	})),
];

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
	{ label: dealPipelineFilterStatusAllLabel, value: 'ALL' },
	...(['OPEN', 'WON', 'LOST'] as const).map((status) => ({
		value: status,
		label: getDealPipelineFilterStatusOptionLabel(status),
	})),
];

const SORT_OPTIONS: { label: string; value: DealPipelineSortMode }[] = (
	['recent', 'value_asc', 'value_desc'] as const
).map((mode) => ({
	value: mode,
	label: getDealPipelineSortDropdownLabel(mode),
}));

function getImportanceLabel(value: ImportanceFilter) {
	return (
		IMPORTANCE_OPTIONS.find((option) => option.value === value)?.label ??
		dealPipelineFilterImportanceLegendLabel
	);
}

function getStatusLabel(value: StatusFilter) {
	return (
		STATUS_OPTIONS.find((option) => option.value === value)?.label ??
		dealPipelineFilterStatusLegendLabel
	);
}

function getPipelineSortTriggerLabel(mode: DealPipelineSortMode) {
	return (
		SORT_OPTIONS.find((option) => option.value === mode)?.label ??
		dealPipelineSortLegendLabel
	);
}

/** Texto do trigger: legenda quando “sem filtro”, senão valor escolhido. */
function getStatusTriggerDisplay(value: StatusFilter) {
	return value === 'ALL'
		? dealPipelineFilterStatusLegendLabel
		: getStatusLabel(value);
}

function getImportanceTriggerDisplay(value: ImportanceFilter) {
	return value === 'ALL'
		? dealPipelineFilterImportanceLegendLabel
		: getImportanceLabel(value);
}

function getSortTriggerDisplay(mode: DealPipelineSortMode) {
	return mode === 'recent'
		? dealPipelineSortLegendLabel
		: getPipelineSortTriggerLabel(mode);
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
	const statusAria =
		statusFilter === 'ALL'
			? 'todos os status'
			: getStatusTriggerDisplay(statusFilter);
	const importanceAria =
		importanceFilter === 'ALL'
			? 'todas as importâncias'
			: getImportanceTriggerDisplay(importanceFilter);
	const sortAria =
		pipelineSortMode === 'recent'
			? 'mais recentes'
			: getSortTriggerDisplay(pipelineSortMode);

	const statusAccent = getPipelineStatusFilterTriggerAccentClass(statusFilter);
	const importanceAccent =
		getPipelineImportanceFilterTriggerAccentClass(importanceFilter);
	const sortAccent = getPipelineSortFilterTriggerAccentClass(pipelineSortMode);

	const neutralTriggerBase =
		'inline-flex h-9 items-center gap-2 rounded-[9px] border border-border bg-white px-[13px] text-[13px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.025)] hover:bg-muted/30';

	return (
		<div className="flex flex-wrap items-center gap-x-[10px] gap-y-2 pt-0.5">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-label={`Filtro de status (${statusAria})`}
						className={cn(neutralTriggerBase, 'min-w-[8.25rem]', statusAccent)}
					>
						<SlidersHorizontal
							className={cn(
								'size-4 shrink-0',
								!statusAccent && 'text-muted-foreground',
							)}
						/>
						<span className="min-w-0 flex-1 truncate text-left">
							{getStatusTriggerDisplay(statusFilter)}
						</span>
						<ChevronDown
							className={cn(
								'size-4 shrink-0',
								!statusAccent && 'text-muted-foreground',
							)}
						/>
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
						aria-label={`Filtro de importância (${importanceAria})`}
						className={cn(
							neutralTriggerBase,
							'min-w-[8.25rem]',
							importanceAccent,
						)}
					>
						<SlidersHorizontal
							className={cn(
								'size-4 shrink-0',
								!importanceAccent && 'text-muted-foreground',
							)}
						/>
						<span className="min-w-0 flex-1 truncate text-left">
							{getImportanceTriggerDisplay(importanceFilter)}
						</span>
						<ChevronDown
							className={cn(
								'size-4 shrink-0',
								!importanceAccent && 'text-muted-foreground',
							)}
						/>
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
						aria-label={`Ordenação (${sortAria})`}
						className={cn(
							neutralTriggerBase,
							'max-w-[min(100%,220px)] min-w-[9.5rem]',
							sortAccent,
						)}
					>
						<ArrowDownUp
							className={cn(
								'size-4 shrink-0',
								!sortAccent && 'text-muted-foreground',
							)}
						/>
						<span className="min-w-0 flex-1 truncate text-left">
							{getSortTriggerDisplay(pipelineSortMode)}
						</span>
						<ChevronDown
							className={cn(
								'size-4 shrink-0',
								!sortAccent && 'text-muted-foreground',
							)}
						/>
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
