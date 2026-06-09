import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	buildCustomPeriodQuery,
	buildMonthPeriodQuery,
	buildPresetPeriodQuery,
	isValidMonthInput,
	toDateInputValue,
	toMonthInputValue,
} from './operational-dashboard-period';

describe('buildPresetPeriodQuery', () => {
	it('builds week range from monday to next monday', () => {
		const query = buildPresetPeriodQuery(
			'week',
			new Date('2026-05-20T12:00:00Z'),
		);

		assert.equal(query.startDate?.slice(0, 10), '2026-05-18');
		assert.equal(query.endDate?.slice(0, 10), '2026-05-25');
	});

	it('builds month and year exclusive-end ranges', () => {
		const now = new Date('2026-05-20T12:00:00Z');

		assert.equal(
			buildPresetPeriodQuery('month', now).startDate?.slice(0, 10),
			'2026-05-01',
		);
		assert.equal(
			buildPresetPeriodQuery('month', now).endDate?.slice(0, 10),
			'2026-06-01',
		);
		assert.equal(
			buildPresetPeriodQuery('year', now).startDate?.slice(0, 10),
			'2026-01-01',
		);
		assert.equal(
			buildPresetPeriodQuery('year', now).endDate?.slice(0, 10),
			'2027-01-01',
		);
	});
});

describe('isValidMonthInput', () => {
	it('accepts YYYY-MM values with valid months', () => {
		assert.equal(isValidMonthInput('2026-04'), true);
		assert.equal(isValidMonthInput('2026-01'), true);
		assert.equal(isValidMonthInput('2026-12'), true);
	});

	it('rejects empty, partial, or invalid month values', () => {
		assert.equal(isValidMonthInput(''), false);
		assert.equal(isValidMonthInput('2026-'), false);
		assert.equal(isValidMonthInput('2026-00'), false);
		assert.equal(isValidMonthInput('2026-13'), false);
		assert.equal(isValidMonthInput('26-04'), false);
	});
});

describe('buildMonthPeriodQuery', () => {
	it('builds exclusive-end UTC ranges from YYYY-MM values', () => {
		const query = buildMonthPeriodQuery('2026-04');

		assert.equal(query.startDate, '2026-04-01T00:00:00.000Z');
		assert.equal(query.endDate, '2026-05-01T00:00:00.000Z');
	});
});

describe('buildCustomPeriodQuery', () => {
	it('converts date inputs to an inclusive UI range with exclusive API end', () => {
		const query = buildCustomPeriodQuery('2026-04-01', '2026-04-30');

		assert.equal(query.startDate?.slice(0, 10), '2026-04-01');
		assert.equal(query.endDate?.slice(0, 10), '2026-05-01');
	});
});

describe('toDateInputValue', () => {
	it('formats local date inputs', () => {
		assert.equal(toDateInputValue(new Date(2026, 4, 9)), '2026-05-09');
	});
});

describe('toMonthInputValue', () => {
	it('formats UTC month inputs', () => {
		assert.equal(
			toMonthInputValue(new Date('2026-05-09T12:00:00.000Z')),
			'2026-05',
		);
	});
});
