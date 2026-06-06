import type { AgendaItem } from '../model/agenda.model';

type AgendaRangePreset = 'all' | 'month' | 'today' | 'week';

const DAYS_IN_WEEK = 7;
const CALENDAR_GRID_WEEKS = 6;
const CALENDAR_GRID_DAYS = DAYS_IN_WEEK * CALENDAR_GRID_WEEKS;
const RECURRENCE_ITERATION_LIMIT = 370;

function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

function addMonths(date: Date, months: number) {
	const next = new Date(date);
	next.setMonth(next.getMonth() + months);
	return next;
}

function startOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}

function endOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(23, 59, 59, 999);
	return next;
}

function startOfMonth(date: Date) {
	const next = new Date(date.getFullYear(), date.getMonth(), 1);
	return startOfDay(next);
}

function endOfMonth(date: Date) {
	return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function endOfToday(date: Date) {
	const next = new Date(date);
	next.setHours(23, 59, 59, 999);
	return next;
}

function buildAgendaRange(preset: AgendaRangePreset, now = new Date()) {
	if (preset === 'all') {
		return {};
	}
	if (preset === 'today') {
		return { from: now.toISOString(), to: endOfToday(now).toISOString() };
	}
	if (preset === 'month') {
		return { from: now.toISOString(), to: addDays(now, 30).toISOString() };
	}
	return { from: now.toISOString(), to: addDays(now, 7).toISOString() };
}

function buildMonthGrid(month: Date) {
	const monthStart = startOfMonth(month);
	const gridStart = addDays(monthStart, -monthStart.getDay());
	return Array.from({ length: CALENDAR_GRID_DAYS }, (_, index) =>
		addDays(gridStart, index),
	);
}

function buildMonthGridRange(month: Date) {
	const days = buildMonthGrid(month);
	const firstDay = days[0] ?? startOfMonth(month);
	const lastDay = days.at(-1) ?? endOfMonth(month);
	return {
		from: startOfDay(firstDay).toISOString(),
		to: endOfDay(lastDay).toISOString(),
	};
}

function agendaItemDate(item: AgendaItem) {
	return item.startsAt ?? item.dueAt ?? item.createdAt;
}

function copyTimeToDate(source: Date, targetDate: Date) {
	const next = new Date(targetDate);
	next.setHours(
		source.getHours(),
		source.getMinutes(),
		source.getSeconds(),
		source.getMilliseconds(),
	);
	return next;
}

function agendaItemRelevantEndDate(item: AgendaItem) {
	if (item.type === 'EVENT') {
		return item.endsAt ?? item.startsAt ?? item.createdAt;
	}
	return item.dueAt ?? item.createdAt;
}

function isAgendaItemOverdue(item: AgendaItem, now = new Date()) {
	if (item.status !== 'SCHEDULED') {
		return false;
	}
	const relevantEndDate = new Date(agendaItemRelevantEndDate(item));
	if (Number.isNaN(relevantEndDate.getTime())) {
		return false;
	}
	return relevantEndDate < now;
}

function isAgendaItemStillRelevantToday(item: AgendaItem, now: Date) {
	return !isAgendaItemOverdue(item, now);
}

function moveAgendaItemToDate(item: AgendaItem, targetDate: Date) {
	const fallbackStart = new Date(targetDate);
	fallbackStart.setHours(9, 0, 0, 0);

	if (item.type === 'TASK') {
		const currentDueAt = item.dueAt ? new Date(item.dueAt) : fallbackStart;
		const nextDueAt = Number.isNaN(currentDueAt.getTime())
			? fallbackStart
			: copyTimeToDate(currentDueAt, targetDate);
		return {
			dueAt: nextDueAt.toISOString(),
			endsAt: null,
			startsAt: null,
		};
	}

	const currentStart = item.startsAt ? new Date(item.startsAt) : fallbackStart;
	const safeStart = Number.isNaN(currentStart.getTime())
		? fallbackStart
		: currentStart;
	const nextStart = copyTimeToDate(safeStart, targetDate);
	const currentEnd = item.endsAt ? new Date(item.endsAt) : null;
	const durationMs =
		currentEnd && !Number.isNaN(currentEnd.getTime())
			? Math.max(currentEnd.getTime() - safeStart.getTime(), 0)
			: 60 * 60 * 1000;
	const nextEnd = new Date(nextStart.getTime() + durationMs);

	return {
		dueAt: null,
		endsAt: nextEnd.toISOString(),
		startsAt: nextStart.toISOString(),
	};
}

function filterSelectedDayAgendaItems(
	items: readonly AgendaItem[],
	selectedDate: Date,
	now = new Date(),
) {
	const isSelectedDateToday =
		agendaDateKey(selectedDate) === agendaDateKey(now);
	if (!isSelectedDateToday) {
		return [...items];
	}
	return items.filter((item) => isAgendaItemStillRelevantToday(item, now));
}

function shiftIsoDate(value: string | null | undefined, deltaMs: number) {
	if (!value) {
		return value;
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return new Date(date.getTime() + deltaMs).toISOString();
}

function nextRecurrenceDate(date: Date, recurrence: AgendaItem['recurrence']) {
	if (recurrence === 'DAILY') {
		return addDays(date, 1);
	}
	if (recurrence === 'WEEKLY') {
		return addDays(date, DAYS_IN_WEEK);
	}
	const next = new Date(date);
	next.setMonth(next.getMonth() + 1);
	return next;
}

function expandRecurringAgendaItems(
	items: readonly AgendaItem[],
	range: { from: string; to: string },
) {
	const from = new Date(range.from);
	const to = new Date(range.to);
	if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
		return [...items];
	}

	const expanded: AgendaItem[] = [];
	for (const item of items) {
		const anchor = new Date(agendaItemDate(item));
		if (Number.isNaN(anchor.getTime()) || item.recurrence === 'NONE') {
			if (!Number.isNaN(anchor.getTime()) && anchor >= from && anchor <= to) {
				expanded.push(item);
			}
			continue;
		}

		let occurrence = new Date(anchor);
		let iterations = 0;
		while (occurrence < from && iterations < RECURRENCE_ITERATION_LIMIT) {
			occurrence = nextRecurrenceDate(occurrence, item.recurrence);
			iterations += 1;
		}

		while (occurrence <= to && iterations < RECURRENCE_ITERATION_LIMIT) {
			const deltaMs = occurrence.getTime() - anchor.getTime();
			expanded.push({
				...item,
				startsAt: shiftIsoDate(item.startsAt, deltaMs),
				endsAt: shiftIsoDate(item.endsAt, deltaMs),
				dueAt: shiftIsoDate(item.dueAt, deltaMs),
			});
			occurrence = nextRecurrenceDate(occurrence, item.recurrence);
			iterations += 1;
		}
	}

	return expanded.sort((a, b) => {
		const aDate = new Date(agendaItemDate(a)).getTime();
		const bDate = new Date(agendaItemDate(b)).getTime();
		return aDate - bDate;
	});
}

function agendaDateKey(date: Date | string | null | undefined) {
	if (!date) {
		return '';
	}
	const parsed = typeof date === 'string' ? new Date(date) : date;
	if (Number.isNaN(parsed.getTime())) {
		return '';
	}
	const year = parsed.getFullYear();
	const month = String(parsed.getMonth() + 1).padStart(2, '0');
	const day = String(parsed.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function formatAgendaMonth(value: Date) {
	return new Intl.DateTimeFormat('pt-BR', {
		month: 'long',
		year: 'numeric',
	}).format(value);
}

function formatAgendaDate(value: string | null | undefined) {
	if (!value) {
		return 'Sem data definida';
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: 'long',
		weekday: 'long',
	}).format(date);
}

function formatAgendaTime(startsAt?: string | null, endsAt?: string | null) {
	if (!startsAt) {
		return 'Horário não definido';
	}
	const start = new Date(startsAt);
	const end = endsAt ? new Date(endsAt) : null;
	if (Number.isNaN(start.getTime())) {
		return startsAt;
	}
	const formatter = new Intl.DateTimeFormat('pt-BR', {
		hour: '2-digit',
		minute: '2-digit',
	});
	if (!end || Number.isNaN(end.getTime())) {
		return formatter.format(start);
	}
	return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatAgendaDateTime(value?: string | null) {
	if (!value) {
		return 'Sem horário definido';
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short',
	}).format(date);
}

function agendaItemTypeLabel(type: AgendaItem['type']) {
	return type === 'TASK' ? 'Tarefa' : 'Compromisso';
}

function agendaItemStatusLabel(status: AgendaItem['status']) {
	switch (status) {
		case 'CANCELLED':
			return 'Cancelado';
		case 'DONE':
			return 'Concluído';
		case 'SCHEDULED':
			return 'Agendado';
	}
}

function agendaRecurrenceLabel(recurrence: AgendaItem['recurrence']) {
	switch (recurrence) {
		case 'DAILY':
			return 'Diária';
		case 'MONTHLY':
			return 'Mensal';
		case 'NONE':
			return 'Não se repete';
		case 'WEEKLY':
			return 'Semanal';
	}
}

export {
	addMonths,
	addDays,
	agendaItemDate,
	agendaDateKey,
	agendaItemStatusLabel,
	agendaItemTypeLabel,
	agendaRecurrenceLabel,
	buildAgendaRange,
	buildMonthGrid,
	buildMonthGridRange,
	expandRecurringAgendaItems,
	filterSelectedDayAgendaItems,
	formatAgendaDateTime,
	formatAgendaMonth,
	formatAgendaDate,
	formatAgendaTime,
	isAgendaItemOverdue,
	moveAgendaItemToDate,
};
export type { AgendaRangePreset };
