'use client';

import { useMemo, useState } from 'react';

import { AgendaCalendarMonth, type CalendarDay } from './AgendaCalendarMonth';
import { AgendaCreateForm } from './AgendaCreateForm';
import { AgendaErrorState } from './AgendaErrorState';
import { AgendaHeader } from './AgendaHeader';
import { AgendaSelectedDayPanel } from './AgendaSelectedDayPanel';
import {
	addMonths,
	agendaDateKey,
	agendaItemDate,
	buildMonthGrid,
	buildMonthGridRange,
	expandRecurringAgendaItems,
	filterSelectedDayAgendaItems,
	formatAgendaDate,
	formatAgendaMonth,
} from '../lib/agenda-formatters';
import {
	useAgendaItemsQuery,
	useCancelAgendaItemMutation,
	useCompleteAgendaItemMutation,
	useCreateAgendaItemMutation,
} from '../hooks/agenda.queries';
import type {
	AgendaItem,
	CreateAgendaItemPayload,
} from '../model/agenda.model';

const AGENDA_LOADING_ROWS = ['first-row', 'second-row', 'third-row'] as const;
const MAX_MONTH_ITEMS = 100;
const EMPTY_AGENDA_ITEMS: AgendaItem[] = [];

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
	const [isCreating, setIsCreating] = useState(false);
	const query = useMemo(() => {
		return { ...buildMonthGridRange(currentMonth), limit: MAX_MONTH_ITEMS };
	}, [currentMonth]);
	const agendaQuery = useAgendaItemsQuery(query);
	const createAgendaItem = useCreateAgendaItemMutation();
	const completeAgendaItem = useCompleteAgendaItemMutation();
	const cancelAgendaItem = useCancelAgendaItemMutation();
	const items = agendaQuery.data?.items ?? EMPTY_AGENDA_ITEMS;
	const visibleItems = useMemo(
		() => expandRecurringAgendaItems(items, query),
		[items, query],
	);
	const todayKey = agendaDateKey(new Date());
	const selectedDateKey = agendaDateKey(selectedDate);
	const itemsByDate = useMemo(() => {
		const grouped = new Map<string, typeof visibleItems>();
		for (const item of visibleItems) {
			const key = agendaDateKey(agendaItemDate(item));
			const current = grouped.get(key) ?? [];
			grouped.set(key, [...current, item]);
		}
		return grouped;
	}, [visibleItems]);
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
	const selectedDayItems = useMemo(
		() =>
			filterSelectedDayAgendaItems(
				itemsByDate.get(selectedDateKey) ?? EMPTY_AGENDA_ITEMS,
				selectedDate,
			),
		[itemsByDate, selectedDate, selectedDateKey],
	);

	function handleCreateAgendaItem(payload: CreateAgendaItemPayload) {
		createAgendaItem.mutate(payload, {
			onSuccess: () => {
				setIsCreating(false);
			},
		});
	}

	function handleTodayClick() {
		const today = new Date();
		setCurrentMonth(today);
		setSelectedDate(today);
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
			<AgendaHeader
				monthLabel={formatAgendaMonth(currentMonth)}
				onCreateClick={() => setIsCreating(true)}
				onNextMonth={() => setCurrentMonth((month) => addMonths(month, 1))}
				onPreviousMonth={() => setCurrentMonth((month) => addMonths(month, -1))}
				onTodayClick={handleTodayClick}
			/>
			{isCreating ? (
				<AgendaCreateForm
					initialDate={selectedDate}
					isSubmitting={createAgendaItem.isPending}
					onCancel={() => setIsCreating(false)}
					onSubmit={handleCreateAgendaItem}
				/>
			) : null}
			{createAgendaItem.isError ? (
				<div
					className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
					role="alert"
				>
					Não foi possível salvar o item da agenda.
				</div>
			) : null}
			{agendaQuery.isPending ? <AgendaLoadingState /> : null}
			{agendaQuery.isError ? (
				<AgendaErrorState
					onRetry={() => {
						agendaQuery.refetch();
					}}
				/>
			) : null}
			{!agendaQuery.isPending && !agendaQuery.isError ? (
				<div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
					<AgendaCalendarMonth
						days={calendarDays}
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
						onCreateClick={() => setIsCreating(true)}
					/>
				</div>
			) : null}
		</div>
	);
}

export { AgendaPageContent };
