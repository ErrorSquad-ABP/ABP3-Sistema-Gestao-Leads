import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DomainValidationError } from '../../domain/errors/domain-validation.error.js';
import { TemporalFilterPolicyService } from './temporal-filter-policy.service.js';

describe('TemporalFilterPolicyService', () => {
	const service = new TemporalFilterPolicyService();

	it('resolves week using ISO week boundaries', () => {
		const resolved = service.resolveForRole(
			{
				period: 'week',
				referenceDate: '2026-04-22',
			},
			'MANAGER',
		);

		assert.deepEqual(resolved, {
			period: 'week',
			startDate: '2026-04-20',
			endDate: '2026-04-26',
			referenceDate: '2026-04-22',
		});
	});

	it('resolves month boundaries from referenceDate', () => {
		const resolved = service.resolveForRole(
			{
				period: 'month',
				referenceDate: '2026-02-10',
			},
			'GENERAL_MANAGER',
		);

		assert.deepEqual(resolved, {
			period: 'month',
			startDate: '2026-02-01',
			endDate: '2026-02-28',
			referenceDate: '2026-02-10',
		});
	});

	it('allows a custom range up to one year for non-admin roles', () => {
		const resolved = service.resolveForRole(
			{
				period: 'custom',
				startDate: '2025-04-22',
				endDate: '2026-04-22',
			},
			'ATTENDANT',
		);

		assert.deepEqual(resolved, {
			period: 'custom',
			startDate: '2025-04-22',
			endDate: '2026-04-22',
			referenceDate: '2025-04-22',
		});
	});

	it('rejects a custom range above one year for non-admin roles', () => {
		assert.throws(
			() =>
				service.resolveForRole(
					{
						period: 'custom',
						startDate: '2025-04-22',
						endDate: '2026-04-23',
					},
					'MANAGER',
				),
			(error: unknown) => {
				assert.ok(error instanceof DomainValidationError);
				assert.equal(error.code, 'temporal_filter.range_exceeds_role_limit');
				assert.equal(error.context?.role, 'MANAGER');
				assert.equal(error.context?.maxAllowedEndDate, '2026-04-22');
				return true;
			},
		);
	});

	it('allows administrators to exceed the one-year limit', () => {
		const resolved = service.resolveForRole(
			{
				period: 'custom',
				startDate: '2024-01-01',
				endDate: '2026-04-22',
			},
			'ADMINISTRATOR',
		);

		assert.deepEqual(resolved, {
			period: 'custom',
			startDate: '2024-01-01',
			endDate: '2026-04-22',
			referenceDate: '2024-01-01',
		});
	});

	it('rejects invalid custom ordering even before checking the role limit', () => {
		assert.throws(
			() =>
				service.resolveForRole(
					{
						period: 'custom',
						startDate: '2026-04-22',
						endDate: '2026-04-01',
					},
					'ADMINISTRATOR',
				),
			(error: unknown) => {
				assert.ok(error instanceof DomainValidationError);
				assert.equal(error.code, 'temporal_filter.invalid_range');
				return true;
			},
		);
	});
});
