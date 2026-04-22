import { Injectable } from '@nestjs/common';

import type { UserRole } from '../../domain/enums/user-role.enum.js';
import { DomainValidationError } from '../../domain/errors/domain-validation.error.js';
import type {
	ResolvedTemporalFilterDto,
	TemporalFilterDto,
} from '../dto/temporal-filter.dto.js';

const MAX_NON_ADMIN_RANGE_YEARS = 1;

function isIsoDateOnly(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00.000Z`);
	if (Number.isNaN(date.getTime())) {
		return false;
	}

	return date.toISOString().slice(0, 10) === value;
}

function parseIsoDateOnly(value: string, field: string): Date {
	if (!isIsoDateOnly(value)) {
		throw new DomainValidationError(
			`${field} must follow YYYY-MM-DD with a real calendar date`,
			{
				code: 'temporal_filter.invalid_date',
				context: {
					field,
					receivedValue: value,
				},
			},
		);
	}

	return new Date(`${value}T00:00:00.000Z`);
}

function formatIsoDateOnly(value: Date): string {
	return value.toISOString().slice(0, 10);
}

function createUtcDate(year: number, month: number, day: number): Date {
	return new Date(Date.UTC(year, month, day));
}

function addUtcDays(value: Date, amount: number): Date {
	const next = new Date(value);
	next.setUTCDate(next.getUTCDate() + amount);
	return next;
}

function daysInUtcMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addUtcYearsClamped(value: Date, amount: number): Date {
	const targetYear = value.getUTCFullYear() + amount;
	const month = value.getUTCMonth();
	const day = Math.min(value.getUTCDate(), daysInUtcMonth(targetYear, month));
	return createUtcDate(targetYear, month, day);
}

function startOfUtcMonth(value: Date): Date {
	return createUtcDate(value.getUTCFullYear(), value.getUTCMonth(), 1);
}

function endOfUtcMonth(value: Date): Date {
	return createUtcDate(
		value.getUTCFullYear(),
		value.getUTCMonth(),
		daysInUtcMonth(value.getUTCFullYear(), value.getUTCMonth()),
	);
}

function startOfUtcYear(value: Date): Date {
	return createUtcDate(value.getUTCFullYear(), 0, 1);
}

function endOfUtcYear(value: Date): Date {
	return createUtcDate(value.getUTCFullYear(), 11, 31);
}

function startOfIsoWeek(value: Date): Date {
	const day = value.getUTCDay();
	const distanceToMonday = day === 0 ? -6 : 1 - day;
	return addUtcDays(value, distanceToMonday);
}

function endOfIsoWeek(value: Date): Date {
	return addUtcDays(startOfIsoWeek(value), 6);
}

@Injectable()
class TemporalFilterPolicyService {
	resolveForRole(
		filter: TemporalFilterDto,
		role: UserRole,
	): ResolvedTemporalFilterDto {
		const resolved = this.resolveRange(filter);
		this.assertRoleRangeLimit(resolved, role);
		return resolved;
	}

	private resolveRange(filter: TemporalFilterDto): ResolvedTemporalFilterDto {
		if (filter.period === 'custom') {
			const startDate = parseIsoDateOnly(filter.startDate, 'startDate');
			const endDate = parseIsoDateOnly(filter.endDate, 'endDate');

			if (startDate.getTime() > endDate.getTime()) {
				throw new DomainValidationError(
					'startDate must be less than or equal to endDate',
					{
						code: 'temporal_filter.invalid_range',
						context: {
							period: filter.period,
							startDate: filter.startDate,
							endDate: filter.endDate,
						},
					},
				);
			}

			return {
				period: filter.period,
				startDate: formatIsoDateOnly(startDate),
				endDate: formatIsoDateOnly(endDate),
				referenceDate: formatIsoDateOnly(startDate),
			};
		}

		const referenceDate = parseIsoDateOnly(
			filter.referenceDate,
			'referenceDate',
		);

		if (filter.period === 'week') {
			return {
				period: filter.period,
				startDate: formatIsoDateOnly(startOfIsoWeek(referenceDate)),
				endDate: formatIsoDateOnly(endOfIsoWeek(referenceDate)),
				referenceDate: formatIsoDateOnly(referenceDate),
			};
		}

		if (filter.period === 'month') {
			return {
				period: filter.period,
				startDate: formatIsoDateOnly(startOfUtcMonth(referenceDate)),
				endDate: formatIsoDateOnly(endOfUtcMonth(referenceDate)),
				referenceDate: formatIsoDateOnly(referenceDate),
			};
		}

		return {
			period: filter.period,
			startDate: formatIsoDateOnly(startOfUtcYear(referenceDate)),
			endDate: formatIsoDateOnly(endOfUtcYear(referenceDate)),
			referenceDate: formatIsoDateOnly(referenceDate),
		};
	}

	private assertRoleRangeLimit(
		filter: ResolvedTemporalFilterDto,
		role: UserRole,
	): void {
		if (role === 'ADMINISTRATOR') {
			return;
		}

		const startDate = parseIsoDateOnly(filter.startDate, 'startDate');
		const endDate = parseIsoDateOnly(filter.endDate, 'endDate');
		const maxAllowedEndDate = addUtcYearsClamped(
			startDate,
			MAX_NON_ADMIN_RANGE_YEARS,
		);

		if (endDate.getTime() > maxAllowedEndDate.getTime()) {
			throw new DomainValidationError(
				'Temporal range exceeds the maximum allowed window for this role',
				{
					code: 'temporal_filter.range_exceeds_role_limit',
					context: {
						role,
						period: filter.period,
						startDate: filter.startDate,
						endDate: filter.endDate,
						maxAllowedEndDate: formatIsoDateOnly(maxAllowedEndDate),
						maxRangeYears: MAX_NON_ADMIN_RANGE_YEARS,
					},
				},
			);
		}
	}
}

export { TemporalFilterPolicyService };
