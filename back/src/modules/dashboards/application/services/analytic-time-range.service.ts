import { Injectable } from '@nestjs/common';

import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import type {
	AnalyticsTimeMode,
	AnalyticsTimeRange,
} from '../../domain/repositories/analytic-dashboard.repository.js';

type ResolveTimeRangeInput = {
	readonly mode: AnalyticsTimeMode;
	readonly referenceDate?: string;
	readonly startDate?: string;
	readonly endDate?: string;
};

const ONE_DAY_IN_MS = 86_400_000;
const NON_ADMIN_MAX_RANGE_DAYS = 366;

function toUtcDate(year: number, monthIndex: number, day: number): Date {
	return new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0));
}

function dateToIso(value: Date): string {
	return value.toISOString().slice(0, 10);
}

function parseDateOnly(value: string, fieldName: string): Date {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new DomainValidationError(
			`Campo ${fieldName} deve usar o formato YYYY-MM-DD.`,
			{
				code: 'dashboard.time_range.invalid_date_format',
				context: { field: fieldName },
			},
		);
	}

	const [yearRaw, monthRaw, dayRaw] = value.split('-');
	const year = Number(yearRaw);
	const month = Number(monthRaw);
	const day = Number(dayRaw);
	const date = toUtcDate(year, month - 1, day);

	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		throw new DomainValidationError(
			`Campo ${fieldName} contem uma data invalida.`,
			{
				code: 'dashboard.time_range.invalid_date_value',
				context: { field: fieldName },
			},
		);
	}

	return date;
}

@Injectable()
class AnalyticTimeRangeService {
	resolve(
		input: ResolveTimeRangeInput,
		role: UserRole,
		now: Date = new Date(),
	): AnalyticsTimeRange {
		const referenceDate = input.referenceDate
			? parseDateOnly(input.referenceDate, 'referenceDate')
			: toUtcDate(
					now.getUTCFullYear(),
					now.getUTCMonth(),
					now.getUTCDate(),
				);

		let startAt: Date;
		let endExclusive: Date;

		switch (input.mode) {
			case 'week': {
				const weekday = referenceDate.getUTCDay();
				const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
				startAt = new Date(referenceDate.getTime() + mondayOffset * ONE_DAY_IN_MS);
				endExclusive = new Date(startAt.getTime() + 7 * ONE_DAY_IN_MS);
				break;
			}
			case 'month': {
				startAt = toUtcDate(
					referenceDate.getUTCFullYear(),
					referenceDate.getUTCMonth(),
					1,
				);
				endExclusive = toUtcDate(
					referenceDate.getUTCFullYear(),
					referenceDate.getUTCMonth() + 1,
					1,
				);
				break;
			}
			case 'year': {
				startAt = toUtcDate(referenceDate.getUTCFullYear(), 0, 1);
				endExclusive = toUtcDate(referenceDate.getUTCFullYear() + 1, 0, 1);
				break;
			}
			case 'custom': {
				if (!input.startDate || !input.endDate) {
					throw new DomainValidationError(
						'Periodo customizado exige startDate e endDate.',
						{
							code: 'dashboard.time_range.custom_requires_bounds',
						},
					);
				}
				startAt = parseDateOnly(input.startDate, 'startDate');
				const endAt = parseDateOnly(input.endDate, 'endDate');
				endExclusive = new Date(endAt.getTime() + ONE_DAY_IN_MS);
				break;
			}
			default: {
				throw new DomainValidationError('Modo de filtro temporal invalido.', {
					code: 'dashboard.time_range.invalid_mode',
				});
			}
		}

		if (endExclusive.getTime() <= startAt.getTime()) {
			throw new DomainValidationError(
				'Data final deve ser maior ou igual a data inicial.',
				{
					code: 'dashboard.time_range.invalid_bounds',
				},
			);
		}

		const totalDays = Math.ceil(
			(endExclusive.getTime() - startAt.getTime()) / ONE_DAY_IN_MS,
		);
		if (role !== 'ADMINISTRATOR' && totalDays > NON_ADMIN_MAX_RANGE_DAYS) {
			throw new DomainValidationError(
				'Usuarios nao administradores podem consultar no maximo um ano por vez.',
				{
					code: 'dashboard.time_range.exceeds_non_admin_limit',
					context: {
						maxDays: NON_ADMIN_MAX_RANGE_DAYS,
						requestedDays: totalDays,
					},
				},
			);
		}

		return {
			mode: input.mode,
			startDate: dateToIso(startAt),
			endDate: dateToIso(new Date(endExclusive.getTime() - ONE_DAY_IN_MS)),
			startAt,
			endExclusive,
		};
	}
}

export { AnalyticTimeRangeService };
export type { ResolveTimeRangeInput };
