import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DomainValidationError } from '../errors/domain-validation.error.js';
import {
	assertCanonicalTemporalFilterMode,
	assertTemporalFilterMode,
	isCanonicalTemporalFilterMode,
	isTemporalFilterMode,
	parseCanonicalTemporalFilterMode,
	parseTemporalFilterMode,
} from './temporal-filter-mode.enum.js';

describe('temporal-filter-mode enum', () => {
	it('accepts canonical values only', () => {
		assert.equal(parseTemporalFilterMode('week'), 'week');
		assert.equal(parseCanonicalTemporalFilterMode('month'), 'month');
		assert.equal(assertTemporalFilterMode('year'), 'year');
		assert.equal(assertCanonicalTemporalFilterMode('custom'), 'custom');
	});

	it('rejects non-canonical values in strict mode', () => {
		assert.throws(
			() => parseTemporalFilterMode(' WEEK '),
			(error: unknown) => {
				assert.ok(error instanceof DomainValidationError);
				assert.equal(error.context?.reason, 'non_canonical_input');
				return true;
			},
		);

		assert.throws(
			() => assertTemporalFilterMode('MONTH'),
			DomainValidationError,
		);
	});

	it('has deterministic predicates for canonical checks', () => {
		assert.equal(isTemporalFilterMode('week'), true);
		assert.equal(isCanonicalTemporalFilterMode('week'), true);
		assert.equal(isTemporalFilterMode('Week'), false);
		assert.equal(isCanonicalTemporalFilterMode(' Week '), false);
		assert.equal(isTemporalFilterMode(undefined), false);
		assert.equal(isCanonicalTemporalFilterMode(null), false);
	});
});
