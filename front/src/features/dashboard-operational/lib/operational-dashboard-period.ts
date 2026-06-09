import type { OperationalDashboardQueryInput } from '../model/operational-dashboard.model';

type OperationalDashboardPeriodMode = 'week' | 'month' | 'year';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(value: Date) {
	return new Date(
		value.getFullYear(),
		value.getMonth(),
		value.getDate(),
		0,
		0,
		0,
		0,
	);
}

function addDays(value: Date, days: number) {
	return new Date(value.getTime() + days * DAY_IN_MS);
}

function toDateInputValue(value: Date) {
	const year = value.getFullYear();
	const month = `${value.getMonth() + 1}`.padStart(2, '0');
	const day = `${value.getDate()}`.padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function toMonthInputValue(value: Date) {
	const year = value.getUTCFullYear();
	const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
	return `${year}-${month}`;
}

function dateInputToLocalDate(value: string) {
	const [yearRaw, monthRaw, dayRaw] = value.split('-');
	return new Date(Number(yearRaw), Number(monthRaw) - 1, Number(dayRaw));
}

function isValidMonthInput(value: string) {
	return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function toQuery(startInclusive: Date, endExclusive: Date) {
	return {
		endDate: endExclusive.toISOString(),
		startDate: startInclusive.toISOString(),
	} satisfies OperationalDashboardQueryInput;
}

function buildPresetPeriodQuery(
	mode: OperationalDashboardPeriodMode,
	now = new Date(),
): OperationalDashboardQueryInput {
	const today = startOfLocalDay(now);

	if (mode === 'week') {
		const weekday = today.getDay();
		const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
		const start = addDays(today, mondayOffset);
		return toQuery(start, addDays(start, 7));
	}

	if (mode === 'month') {
		const start = new Date(today.getFullYear(), today.getMonth(), 1);
		const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
		return toQuery(start, end);
	}

	const start = new Date(today.getFullYear(), 0, 1);
	const end = new Date(today.getFullYear() + 1, 0, 1);
	return toQuery(start, end);
}

function buildMonthPeriodQuery(month: string): OperationalDashboardQueryInput {
	const [yearRaw, monthRaw] = month.split('-');
	const year = Number(yearRaw);
	const monthIndex = Number(monthRaw) - 1;
	const start = new Date(Date.UTC(year, monthIndex, 1));
	const end = new Date(Date.UTC(year, monthIndex + 1, 1));
	return toQuery(start, end);
}

function buildCustomPeriodQuery(
	startDate: string,
	endDate: string,
): OperationalDashboardQueryInput {
	const start = startOfLocalDay(dateInputToLocalDate(startDate));
	const end = addDays(startOfLocalDay(dateInputToLocalDate(endDate)), 1);
	return toQuery(start, end);
}

export type { OperationalDashboardPeriodMode };
export {
	buildCustomPeriodQuery,
	buildMonthPeriodQuery,
	buildPresetPeriodQuery,
	isValidMonthInput,
	toDateInputValue,
	toMonthInputValue,
};
