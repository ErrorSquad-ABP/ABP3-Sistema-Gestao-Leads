import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsIn,
	IsOptional,
	IsString,
	Validate,
	type ValidationArguments,
	ValidatorConstraint,
	type ValidatorConstraintInterface,
} from 'class-validator';

import type { TemporalFilterDto } from '../../application/dto/temporal-filter.dto.js';
import { TEMPORAL_FILTER_MODES } from '../../domain/enums/temporal-filter-mode.enum.js';

const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TEMPORAL_FILTER_MODE_VALUES = [...TEMPORAL_FILTER_MODES] as string[];

function normalizeOptionalString(value: unknown): unknown {
	if (typeof value !== 'string') {
		return value;
	}

	const normalized = value.trim();
	return normalized.length === 0 ? undefined : normalized;
}

function normalizeOptionalMode(value: unknown): unknown {
	if (typeof value !== 'string') {
		return value;
	}

	const normalized = value.trim().toLowerCase();
	return normalized.length === 0 ? undefined : normalized;
}

function isIsoDateOnly(value: string): boolean {
	if (!ISO_DATE_ONLY_REGEX.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00.000Z`);
	if (Number.isNaN(date.getTime())) {
		return false;
	}

	return date.toISOString().slice(0, 10) === value;
}

@ValidatorConstraint({ name: 'IsIsoDateOnly', async: false })
class IsoDateOnlyConstraint implements ValidatorConstraintInterface {
	validate(value: unknown): boolean {
		return typeof value === 'string' && isIsoDateOnly(value);
	}

	defaultMessage(args: ValidationArguments): string {
		return `${args.property} deve seguir o formato YYYY-MM-DD.`;
	}
}

@ValidatorConstraint({ name: 'TemporalFilterQueryContract', async: false })
class TemporalFilterQueryContractConstraint
	implements ValidatorConstraintInterface
{
	validate(_value: unknown, args: ValidationArguments): boolean {
		const query = args.object as TemporalFilterQueryValidator;

		if (!query.period) {
			return true;
		}

		if (query.period === 'custom') {
			if (!query.startDate || !query.endDate) {
				return false;
			}

			if (query.referenceDate) {
				return false;
			}

			if (!isIsoDateOnly(query.startDate) || !isIsoDateOnly(query.endDate)) {
				return true;
			}

			return query.startDate <= query.endDate;
		}

		if (!query.referenceDate) {
			return false;
		}

		return !query.startDate && !query.endDate;
	}

	defaultMessage(args: ValidationArguments): string {
		const query = args.object as TemporalFilterQueryValidator;

		if (query.period === 'custom') {
			if (!query.startDate || !query.endDate) {
				return 'period=custom exige startDate e endDate em formato YYYY-MM-DD.';
			}

			if (query.referenceDate) {
				return 'period=custom nao aceita referenceDate; use apenas startDate e endDate.';
			}

			if (
				isIsoDateOnly(query.startDate) &&
				isIsoDateOnly(query.endDate) &&
				query.startDate > query.endDate
			) {
				return 'startDate deve ser menor ou igual a endDate.';
			}
		}

		if (!query.referenceDate) {
			return 'period=week|month|year exige referenceDate em formato YYYY-MM-DD.';
		}

		return 'period=week|month|year nao aceita startDate ou endDate; use apenas referenceDate.';
	}
}

class TemporalFilterQueryValidator {
	@ApiPropertyOptional({
		enum: TEMPORAL_FILTER_MODES,
		description:
			'Modo do filtro temporal. week, month e year usam referenceDate; custom usa startDate e endDate.',
		example: 'month',
	})
	@Transform(({ value }) => normalizeOptionalMode(value))
	@IsString()
	@IsIn(TEMPORAL_FILTER_MODE_VALUES)
	@Validate(TemporalFilterQueryContractConstraint)
	period!: string;

	@ApiPropertyOptional({
		format: 'date',
		description:
			'Data de referencia no formato YYYY-MM-DD. Obrigatoria para week, month e year.',
		example: '2026-04-22',
	})
	@IsOptional()
	@Transform(({ value }) => normalizeOptionalString(value))
	@IsString()
	@Validate(IsoDateOnlyConstraint)
	referenceDate?: string;

	@ApiPropertyOptional({
		format: 'date',
		description:
			'Data inicial do periodo customizado no formato YYYY-MM-DD. Obrigatoria quando period=custom.',
		example: '2026-04-01',
	})
	@IsOptional()
	@Transform(({ value }) => normalizeOptionalString(value))
	@IsString()
	@Validate(IsoDateOnlyConstraint)
	startDate?: string;

	@ApiPropertyOptional({
		format: 'date',
		description:
			'Data final do periodo customizado no formato YYYY-MM-DD. Obrigatoria quando period=custom.',
		example: '2026-04-22',
	})
	@IsOptional()
	@Transform(({ value }) => normalizeOptionalString(value))
	@IsString()
	@Validate(IsoDateOnlyConstraint)
	endDate?: string;

	toDto(): TemporalFilterDto {
		if (this.period === 'custom') {
			return {
				period: 'custom',
				startDate: this.startDate as string,
				endDate: this.endDate as string,
			};
		}

		return {
			period: this.period as 'week' | 'month' | 'year',
			referenceDate: this.referenceDate as string,
		};
	}
}

export {
	IsoDateOnlyConstraint,
	TemporalFilterQueryContractConstraint,
	TemporalFilterQueryValidator,
};
