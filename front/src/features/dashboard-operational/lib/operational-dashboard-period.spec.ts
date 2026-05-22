import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	buildCustomPeriodQuery,
	buildPresetPeriodQuery,
	toDateInputValue,
} from './operational-dashboard-period';

describe('buildPresetPeriodQuery', () => {
	it('keeps last30 delegated to backend default', () => {
		assert.deepEqual(
			buildPresetPeriodQuery('last30', new Date('2026-05-20T12:00:00Z')),
			{},
		);
	});

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
