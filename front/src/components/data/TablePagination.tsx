'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationItem = number | 'ellipsis-end' | 'ellipsis-start';

type TablePaginationProps = {
	readonly className?: string;
	readonly isLoading?: boolean;
	readonly itemLabel?: string;
	readonly onPageChange: (page: number) => void;
	readonly onPageSizeChange?: (pageSize: number) => void;
	readonly page: number;
	readonly pageSize: number;
	readonly pageSizeOptions: readonly number[];
	readonly totalItems: number;
	readonly totalPages: number;
};

const ADJACENT_PAGE_OFFSET = 1;
const COMPACT_PAGE_COUNT = 5;
const DEFAULT_PAGE_SIZE = 10;
const LEADING_WINDOW_PAGES = [1, 2, 3, 4] as const;
const LEADING_WINDOW_END = 4;
const MIN_PAGE = 1;
const MIN_TOTAL_PAGES = 1;
const TRAILING_WINDOW_START_OFFSET = 3;
const TRAILING_WINDOW_THRESHOLD_OFFSET = 2;

function toPositiveInteger(value: number, fallback: number): number {
	if (!Number.isFinite(value) || value <= 0) {
		return Number.isFinite(fallback) && fallback > 0 ? Math.trunc(fallback) : 0;
	}

	return Math.trunc(value);
}

function toNonNegativeInteger(value: number): number {
	if (!Number.isFinite(value) || value <= 0) {
		return 0;
	}

	return Math.trunc(value);
}

function clampPage(page: number, totalPages: number): number {
	const safeTotal = toPositiveInteger(totalPages, MIN_TOTAL_PAGES);
	const safePage = Number.isFinite(page) ? Math.trunc(page) : MIN_PAGE;
	return Math.min(Math.max(MIN_PAGE, safePage), safeTotal);
}

function buildPaginationItems(
	page: number,
	totalPages: number,
): PaginationItem[] {
	const safeTotal = toPositiveInteger(totalPages, MIN_TOTAL_PAGES);
	const currentPage = clampPage(page, safeTotal);

	if (safeTotal <= COMPACT_PAGE_COUNT) {
		return Array.from({ length: safeTotal }, (_, index) => index + MIN_PAGE);
	}

	if (currentPage <= LEADING_WINDOW_END) {
		return [...LEADING_WINDOW_PAGES, 'ellipsis-end', safeTotal];
	}

	if (currentPage >= safeTotal - TRAILING_WINDOW_THRESHOLD_OFFSET) {
		return [
			MIN_PAGE,
			'ellipsis-start',
			safeTotal - TRAILING_WINDOW_START_OFFSET,
			safeTotal - TRAILING_WINDOW_THRESHOLD_OFFSET,
			safeTotal - ADJACENT_PAGE_OFFSET,
			safeTotal,
		];
	}

	return [
		MIN_PAGE,
		'ellipsis-start',
		currentPage - ADJACENT_PAGE_OFFSET,
		currentPage,
		currentPage + ADJACENT_PAGE_OFFSET,
		'ellipsis-end',
		safeTotal,
	];
}

function buildPageSizeOptions(
	pageSizeOptions: readonly number[],
	currentPageSize: number,
): number[] {
	const options = pageSizeOptions
		.map((option) => toPositiveInteger(option, 0))
		.filter((option) => option > 0);
	const uniqueOptions = Array.from(new Set(options));

	return uniqueOptions.includes(currentPageSize)
		? uniqueOptions
		: [...uniqueOptions, currentPageSize];
}

function TablePagination({
	className,
	isLoading = false,
	itemLabel = 'itens',
	onPageChange,
	onPageSizeChange,
	page,
	pageSize,
	pageSizeOptions,
	totalItems,
	totalPages,
}: TablePaginationProps) {
	const fallbackPageSize =
		pageSizeOptions.find((option) => Number.isFinite(option) && option > 0) ??
		DEFAULT_PAGE_SIZE;
	const safePageSize = toPositiveInteger(pageSize, fallbackPageSize);
	const safeTotalItems = toNonNegativeInteger(totalItems);
	const safeTotalPages = toPositiveInteger(totalPages, MIN_TOTAL_PAGES);
	const currentPage = clampPage(page, safeTotalPages);
	const firstVisibleItem =
		safeTotalItems <= 0
			? 0
			: (currentPage - ADJACENT_PAGE_OFFSET) * safePageSize + MIN_PAGE;
	const lastVisibleItem =
		safeTotalItems <= 0
			? 0
			: Math.min(currentPage * safePageSize, safeTotalItems);
	const paginationItems = buildPaginationItems(currentPage, safeTotalPages);
	const normalizedPageSizeOptions = buildPageSizeOptions(
		pageSizeOptions,
		safePageSize,
	);
	const previousDisabled = isLoading || currentPage <= MIN_PAGE;
	const nextDisabled = isLoading || currentPage >= safeTotalPages;

	return (
		<nav
			aria-label="Paginação da tabela"
			className={cn(
				'grid gap-3 border-t border-[color:var(--table-border)] px-5 py-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center',
				className,
			)}
		>
			<p className="text-sm text-muted-foreground">
				Mostrando {firstVisibleItem} a {lastVisibleItem} de {safeTotalItems}{' '}
				{itemLabel}
			</p>
			<div className="flex items-center justify-center gap-2">
				<Button
					aria-label="Página anterior"
					className="size-9 rounded-lg border-[color:var(--table-border)]"
					disabled={previousDisabled}
					onClick={() => {
						if (!previousDisabled) {
							onPageChange(currentPage - ADJACENT_PAGE_OFFSET);
						}
					}}
					size="icon-sm"
					type="button"
					variant="outline"
				>
					<ChevronLeft className="size-4" />
				</Button>
				{paginationItems.map((item) =>
					typeof item === 'string' ? (
						<span
							aria-hidden="true"
							className="px-2 text-sm font-semibold text-muted-foreground"
							key={item}
						>
							...
						</span>
					) : (
						<Button
							aria-current={item === currentPage ? 'page' : undefined}
							className={cn(
								'min-w-9 rounded-lg px-3 text-sm font-semibold shadow-none',
								item === currentPage
									? 'bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-accent-hover)] hover:bg-[color:var(--brand-accent-soft)]'
									: 'text-foreground hover:bg-[color:var(--table-row-hover)]',
							)}
							disabled={isLoading}
							key={item}
							onClick={() => {
								if (!isLoading && item !== currentPage) {
									onPageChange(item);
								}
							}}
							type="button"
							variant="ghost"
						>
							{item}
						</Button>
					),
				)}
				<Button
					aria-label="Próxima página"
					className="size-9 rounded-lg border-[color:var(--table-border)]"
					disabled={nextDisabled}
					onClick={() => {
						if (!nextDisabled) {
							onPageChange(currentPage + ADJACENT_PAGE_OFFSET);
						}
					}}
					size="icon-sm"
					type="button"
					variant="outline"
				>
					<ChevronRight className="size-4" />
				</Button>
			</div>
			{onPageSizeChange ? (
				<label className="flex items-center justify-start gap-2 text-sm text-muted-foreground lg:justify-end">
					Itens por página:
					<select
						className="h-9 rounded-lg border border-[color:var(--table-border)] bg-white px-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
						disabled={isLoading}
						onChange={(event) => onPageSizeChange(Number(event.target.value))}
						value={safePageSize}
					>
						{normalizedPageSizeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>
			) : (
				<span aria-hidden="true" />
			)}
		</nav>
	);
}

export { TablePagination, buildPaginationItems };
export type { PaginationItem, TablePaginationProps };
