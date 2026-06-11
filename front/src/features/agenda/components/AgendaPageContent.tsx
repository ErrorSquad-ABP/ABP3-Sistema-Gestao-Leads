'use client';

import { useMemo, useState } from 'react';

import { AgendaCalendarMonth, type CalendarDay } from './AgendaCalendarMonth';
import { AgendaDayView } from './AgendaDayView';
import { AgendaErrorState } from './AgendaErrorState';
import { AgendaHeader } from './AgendaHeader';
import { AgendaItemDialog } from './AgendaItemDialog';
import { AgendaMoveDialog } from './AgendaMoveDialog';
import { AgendaRemindersPanel } from './AgendaRemindersPanel';
import { AgendaSelectedDayPanel } from './AgendaSelectedDayPanel';
import { AgendaTodayPanel } from './AgendaTodayPanel';
import { AgendaUpcomingList } from './AgendaUpcomingList';
import { AgendaWeekView } from './AgendaWeekView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	addDays,
	addMonths,
	agendaDateKey,
	agendaItemDate,
	buildMonthGrid,
	buildMonthGridRange,
	expandRecurringAgendaItems,
	filterSelectedDayAgendaItems,
	formatAgendaDate,
	formatAgendaDateTime,
	formatAgendaMonth,
	isAgendaItemOverdue,
} from '../lib/agenda-formatters';
import {
	useAgendaItemsQuery,
	useAgendaMetricsQuery,
	useCancelAgendaItemMutation,
	useCompleteAgendaItemMutation,
	useCreateAgendaItemMutation,
	useUpdateAgendaItemMutation,
} from '../hooks/agenda.queries';
import type {
	AgendaItem,
	CreateAgendaItemPayload,
	UpdateAgendaItemPayload,
} from '../model/agenda.model';

const AGENDA_LOADING_ROWS = ['first-row', 'second-row', 'third-row'] as const;
const MAX_MONTH_ITEMS = 100;
const EMPTY_AGENDA_ITEMS: AgendaItem[] = [];
const AGENDA_VIEW_OPTIONS = [
	{ label: 'Mês', value: 'month' },
	{ label: 'Semana', value: 'week' },
	{ label: 'Dia', value: 'day' },
	{ label: 'Lista', value: 'list' },
] as const;
type AgendaDialogState =
	| { mode: 'closed' }
	| { date: Date; mode: 'create' }
	| { item: AgendaItem; mode: 'edit' };
type AgendaViewFilter = 'all' | 'overdue';
type AgendaViewMode = (typeof AGENDA_VIEW_OPTIONS)[number]['value'];

function AgendaLoadingState() {
	return (
		<div className="space-y-3" role="status">
			{AGENDA_LOADING_ROWS.map((row) => (
				<div
					className="h-28 animate-pulse rounded-lg border border-border bg-muted/50"
					key={row}
				/>
			))}
		</div>
	);
}

function AgendaPageContent() {
	const [currentMonth, setCurrentMonth] = useState(() => new Date());
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [dialogState, setDialogState] = useState<AgendaDialogState>({
		mode: 'closed',
	});
	const [moveDialogItem, setMoveDialogItem] = useState<AgendaItem | null>(null);
	const [searchInput, setSearchInput] = useState('');
	const [submittedSearch, setSubmittedSearch] = useState('');
	const [viewMode, setViewMode] = useState<AgendaViewMode>('month');
	const [viewFilter, setViewFilter] = useState<AgendaViewFilter>('all');
	const monthRange = useMemo(
		() => buildMonthGridRange(currentMonth),
		[currentMonth],
	);
	const query = useMemo(() => {
		if (submittedSearch.trim()) {
			return { limit: MAX_MONTH_ITEMS, search: submittedSearch.trim() };
		}
		return { ...monthRange, limit: MAX_MONTH_ITEMS };
	}, [monthRange, submittedSearch]);
	const agendaQuery = useAgendaItemsQuery(query);
	const metricsQuery = useAgendaMetricsQuery();
	const createAgendaItem = useCreateAgendaItemMutation();
	const updateAgendaItem = useUpdateAgendaItemMutation();
	const completeAgendaItem = useCompleteAgendaItemMutation();
	const cancelAgendaItem = useCancelAgendaItemMutation();
	const items = agendaQuery.data?.items ?? EMPTY_AGENDA_ITEMS;
	const visibleItems = useMemo(() => {
		if (submittedSearch.trim()) {
			return items;
		}
		return expandRecurringAgendaItems(items, monthRange);
	}, [items, monthRange, submittedSearch]);
	const filteredVisibleItems = useMemo(() => {
		if (viewFilter === 'overdue') {
			return visibleItems.filter((item) => isAgendaItemOverdue(item));
		}
		return visibleItems;
	}, [viewFilter, visibleItems]);
	const todayKey = agendaDateKey(new Date());
	const selectedDateKey = agendaDateKey(selectedDate);
	const itemsByDate = useMemo(() => {
		const grouped = new Map<string, typeof filteredVisibleItems>();
		for (const item of filteredVisibleItems) {
			const key = agendaDateKey(agendaItemDate(item));
			const current = grouped.get(key) ?? [];
			grouped.set(key, [...current, item]);
		}
		return grouped;
	}, [filteredVisibleItems]);
	const calendarDays: CalendarDay[] = useMemo(() => {
		const month = currentMonth.getMonth();
		return buildMonthGrid(currentMonth).map((date) => {
			const key = agendaDateKey(date);
			return {
				date,
				isCurrentMonth: date.getMonth() === month,
				isSelected: key === selectedDateKey,
				isToday: key === todayKey,
				items: itemsByDate.get(key) ?? [],
				key,
			};
		});
	}, [currentMonth, itemsByDate, selectedDateKey, todayKey]);
	const selectedDayItems = useMemo(() => {
		const dayItems = itemsByDate.get(selectedDateKey) ?? EMPTY_AGENDA_ITEMS;
		if (viewFilter === 'overdue') {
			return dayItems;
		}
		return filterSelectedDayAgendaItems(dayItems, selectedDate);
	}, [itemsByDate, selectedDate, selectedDateKey, viewFilter]);

	const headerLabel =
		viewMode === 'month'
			? formatAgendaMonth(currentMonth)
			: formatAgendaDateTime(selectedDate.toISOString());

	function openCreateDialog(date: Date) {
		createAgendaItem.reset();
		updateAgendaItem.reset();
		setSelectedDate(date);
		if (date.getMonth() !== currentMonth.getMonth()) {
			setCurrentMonth(date);
		}
		setDialogState({ mode: 'create', date });
	}

	function openMoveDialog(item: AgendaItem) {
		setMoveDialogItem(item);
	}

	function closeMoveDialog() {
		setMoveDialogItem(null);
	}

	function openEditDialog(item: AgendaItem) {
		createAgendaItem.reset();
		updateAgendaItem.reset();
		setDialogState({ mode: 'edit', item });
	}

	function closeDialog() {
		createAgendaItem.reset();
		updateAgendaItem.reset();
		setDialogState({ mode: 'closed' });
	}

	function handleCreateAgendaItem(payload: CreateAgendaItemPayload) {
		createAgendaItem.mutate(payload, {
			onSuccess: () => {
				closeDialog();
			},
		});
	}

	function handleUpdateAgendaItem(payload: UpdateAgendaItemPayload) {
		if (dialogState.mode !== 'edit') {
			return;
		}
		updateAgendaItem.mutate(
			{ id: dialogState.item.id, payload },
			{
				onSuccess: () => {
					closeDialog();
				},
			},
		);
	}

	function handleTodayClick() {
		const today = new Date();
		setCurrentMonth(today);
		setSelectedDate(today);
	}

	function navigatePrevious() {
		if (viewMode === 'day') {
			const nextDate = addDays(selectedDate, -1);
			setSelectedDate(nextDate);
			setCurrentMonth(nextDate);
			return;
		}
		if (viewMode === 'week') {
			const nextDate = addDays(selectedDate, -7);
			setSelectedDate(nextDate);
			setCurrentMonth(nextDate);
			return;
		}
		setCurrentMonth((month) => addMonths(month, -1));
	}

	function navigateNext() {
		if (viewMode === 'day') {
			const nextDate = addDays(selectedDate, 1);
			setSelectedDate(nextDate);
			setCurrentMonth(nextDate);
			return;
		}
		if (viewMode === 'week') {
			const nextDate = addDays(selectedDate, 7);
			setSelectedDate(nextDate);
			setCurrentMonth(nextDate);
			return;
		}
		setCurrentMonth((month) => addMonths(month, 1));
	}

	function submitSearch() {
		setSubmittedSearch(searchInput.trim());
	}

	function clearSearch() {
		setSearchInput('');
		setSubmittedSearch('');
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
			<AgendaHeader
				monthLabel={headerLabel}
				onCreateClick={() => openCreateDialog(selectedDate)}
				onNextMonth={navigateNext}
				onPreviousMonth={navigatePrevious}
				onTodayClick={handleTodayClick}
			/>
			<div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-none lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
				<div className="space-y-2">
					<label
						className="text-sm font-medium text-foreground"
						htmlFor="agenda-search"
					>
						Buscar na agenda
					</label>
					<Input
						id="agenda-search"
						onChange={(event) => setSearchInput(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								submitSearch();
							}
						}}
						placeholder="Título, descrição ou lead"
						value={searchInput}
					/>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button onClick={submitSearch} type="button" variant="outline">
						Buscar
					</Button>
					<Button onClick={clearSearch} type="button" variant="ghost">
						Limpar
					</Button>
				</div>
			</div>
			<AgendaItemDialog
				errorMessage={
					createAgendaItem.isError || updateAgendaItem.isError
						? 'Não foi possível salvar o item da agenda.'
						: null
				}
				initialDate={
					dialogState.mode === 'create' ? dialogState.date : selectedDate
				}
				isSubmitting={createAgendaItem.isPending || updateAgendaItem.isPending}
				item={dialogState.mode === 'edit' ? dialogState.item : null}
				mode={dialogState.mode === 'edit' ? 'edit' : 'create'}
				onOpenChange={(open) => {
					if (!open) {
						closeDialog();
					}
				}}
				onSubmit={(payload) => {
					if (dialogState.mode === 'edit') {
						handleUpdateAgendaItem(payload);
						return;
					}
					handleCreateAgendaItem(payload);
				}}
				open={dialogState.mode !== 'closed'}
			/>
			<AgendaMoveDialog
				isSubmitting={updateAgendaItem.isPending}
				item={moveDialogItem}
				onMove={(item, payload) => {
					updateAgendaItem.mutate(
						{ id: item.id, payload },
						{
							onSuccess: () => {
								closeMoveDialog();
							},
						},
					);
				}}
				onOpenChange={(open) => {
					if (!open) {
						closeMoveDialog();
					}
				}}
				open={moveDialogItem !== null}
			/>
			{agendaQuery.isPending ? <AgendaLoadingState /> : null}
			{agendaQuery.isError ? (
				<AgendaErrorState
					onRetry={() => {
						agendaQuery.refetch();
					}}
				/>
			) : null}
			{!agendaQuery.isPending && !agendaQuery.isError ? (
				<>
					<AgendaTodayPanel
						items={visibleItems}
						metrics={metricsQuery.data ?? null}
						onCancel={(id) => cancelAgendaItem.mutate(id)}
						onComplete={(id) => completeAgendaItem.mutate(id)}
						onEdit={openEditDialog}
						onMove={openMoveDialog}
						remindersPanel={
							<AgendaRemindersPanel items={visibleItems} />
						}
					/>
					<div className="flex flex-wrap gap-2">
						<button
							className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
							data-active={viewFilter === 'all'}
							onClick={() => setViewFilter('all')}
							type="button"
						>
							Todas
						</button>
						<button
							className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
							data-active={viewFilter === 'overdue'}
							onClick={() => setViewFilter('overdue')}
							type="button"
						>
							Atrasadas
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{AGENDA_VIEW_OPTIONS.map((option) => (
							<button
								className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
								data-active={viewMode === option.value}
								key={option.value}
								onClick={() => setViewMode(option.value)}
								type="button"
							>
								{option.label}
							</button>
						))}
					</div>
					{viewMode === 'month' ? (
						<div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
							<AgendaCalendarMonth
								days={calendarDays}
								onCreateDate={openCreateDialog}
								onSelectDate={(date) => {
									setSelectedDate(date);
									if (date.getMonth() !== currentMonth.getMonth()) {
										setCurrentMonth(date);
									}
								}}
							/>
							<AgendaSelectedDayPanel
								dateLabel={formatAgendaDate(selectedDate.toISOString())}
								items={selectedDayItems}
								onCancel={(id) => cancelAgendaItem.mutate(id)}
								onComplete={(id) => completeAgendaItem.mutate(id)}
								onCreateClick={() => openCreateDialog(selectedDate)}
								onEdit={openEditDialog}
								onMove={openMoveDialog}
							/>
						</div>
					) : null}
					{viewMode === 'week' ? (
						<AgendaWeekView
							itemsByDate={itemsByDate}
							onCreateDate={openCreateDialog}
							onSelectDate={(date) => {
								setSelectedDate(date);
								setCurrentMonth(date);
							}}
							selectedDate={selectedDate}
						/>
					) : null}
					{viewMode === 'day' ? (
						<AgendaDayView
							dateLabel={formatAgendaDate(selectedDate.toISOString())}
							items={selectedDayItems}
							onCancel={(id) => cancelAgendaItem.mutate(id)}
							onComplete={(id) => completeAgendaItem.mutate(id)}
							onCreateClick={() => openCreateDialog(selectedDate)}
							onEdit={openEditDialog}
							onMove={openMoveDialog}
						/>
					) : null}
					{viewMode === 'list' ? (
						<AgendaUpcomingList
							items={visibleItems}
							onCancel={(id) => cancelAgendaItem.mutate(id)}
							onComplete={(id) => completeAgendaItem.mutate(id)}
							onEdit={openEditDialog}
							onMove={openMoveDialog}
						/>
					) : null}
				</>
			) : null}
		</div>
	);
}

export { AgendaPageContent };
