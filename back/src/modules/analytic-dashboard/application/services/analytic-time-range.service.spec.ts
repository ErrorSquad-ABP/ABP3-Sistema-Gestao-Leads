import assert from 'node:assert/strict';
import test from 'node:test';

import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { AnalyticTimeRangeService } from './analytic-time-range.service.js';

test('AnalyticTimeRangeService resolves week ranges using monday as first day', () => {
	const service = new AnalyticTimeRangeService();

	const range = service.resolve(
		{ mode: 'week', referenceDate: '2026-04-25' },
		'MANAGER',
	);

	assert.equal(range.startDate, '2026-04-20');
	assert.equal(range.endDate, '2026-04-26');
});

test('AnalyticTimeRangeService requires start and end for custom mode', () => {
	const service = new AnalyticTimeRangeService();

	assert.throws(
		() =>
			service.resolve({ mode: 'custom', startDate: '2026-04-01' }, 'MANAGER'),
		(error: unknown) =>
			error instanceof DomainValidationError &&
			error.code === 'dashboard.time_range.custom_requires_bounds',
	);
});

test('AnalyticTimeRangeService blocks non admins above one year', () => {
	const service = new AnalyticTimeRangeService();

	assert.throws(
		() =>
			service.resolve(
				{
					mode: 'custom',
					startDate: '2025-01-01',
					endDate: '2026-02-01',
				},
				'GENERAL_MANAGER',
			),
		(error: unknown) =>
			error instanceof DomainValidationError &&
			error.code === 'dashboard.time_range.exceeds_non_admin_limit',
	);
});

test('AnalyticTimeRangeService allows admin custom range above one year', () => {
	const service = new AnalyticTimeRangeService();

	const range = service.resolve(
		{
			mode: 'custom',
			startDate: '2024-01-01',
			endDate: '2026-04-25',
		},
		'ADMINISTRATOR',
	);

	assert.equal(range.startDate, '2024-01-01');
	assert.equal(range.endDate, '2026-04-25');
});
