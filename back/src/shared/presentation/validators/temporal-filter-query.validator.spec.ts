import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { TemporalFilterQueryValidator } from './temporal-filter-query.validator.js';

function validateQuery(input: Record<string, unknown>) {
	return validateSync(plainToInstance(TemporalFilterQueryValidator, input));
}

describe('TemporalFilterQueryValidator', () => {
	it('accepts preset filters with referenceDate', () => {
		const validator = plainToInstance(TemporalFilterQueryValidator, {
			period: ' month ',
			referenceDate: '2026-04-22',
		});
		const errors = validateSync(validator);

		assert.deepEqual(errors, []);
		assert.deepEqual(validator.toDto(), {
			period: 'month',
			referenceDate: '2026-04-22',
		});
	});

	it('accepts custom filters with startDate and endDate', () => {
		const validator = plainToInstance(TemporalFilterQueryValidator, {
			period: 'custom',
			startDate: '2026-04-01',
			endDate: '2026-04-22',
		});
		const errors = validateSync(validator);

		assert.deepEqual(errors, []);
		assert.deepEqual(validator.toDto(), {
			period: 'custom',
			startDate: '2026-04-01',
			endDate: '2026-04-22',
		});
	});

	it('rejects custom filters without both boundaries', () => {
		const [error] = validateQuery({
			period: 'custom',
			startDate: '2026-04-01',
		});

		assert.ok(error);
		assert.deepEqual(error.constraints, {
			TemporalFilterQueryContract:
				'period=custom exige startDate e endDate em formato YYYY-MM-DD.',
		});
	});

	it('rejects preset filters with custom boundaries', () => {
		const [error] = validateQuery({
			period: 'week',
			referenceDate: '2026-04-22',
			startDate: '2026-04-01',
		});

		assert.ok(error);
		assert.deepEqual(error.constraints, {
			TemporalFilterQueryContract:
				'period=week|month|year nao aceita startDate ou endDate; use apenas referenceDate.',
		});
	});

	it('rejects custom filters when startDate is after endDate', () => {
		const [error] = validateQuery({
			period: 'custom',
			startDate: '2026-04-22',
			endDate: '2026-04-01',
		});

		assert.ok(error);
		assert.deepEqual(error.constraints, {
			TemporalFilterQueryContract:
				'startDate deve ser menor ou igual a endDate.',
		});
	});

	it('rejects impossible calendar dates', () => {
		const [error] = validateQuery({
			period: 'year',
			referenceDate: '2026-02-31',
		});

		assert.ok(error);
		assert.deepEqual(error.constraints, {
			IsIsoDateOnly: 'referenceDate deve seguir o formato YYYY-MM-DD.',
		});
	});
});
