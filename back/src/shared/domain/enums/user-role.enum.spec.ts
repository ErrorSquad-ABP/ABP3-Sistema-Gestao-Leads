import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DomainValidationError } from '../errors/domain-validation.error.js';
import {
	assertCanonicalUserRole,
	assertUserRole,
	isCanonicalUserRole,
	isUserRole,
	parseCanonicalUserRole,
	parseUserRole,
} from './user-role.enum.js';

describe('user-role enum', () => {
	it('accepts canonical values only', () => {
		assert.equal(parseUserRole('MANAGER'), 'MANAGER');
		assert.equal(parseCanonicalUserRole('ATTENDANT'), 'ATTENDANT');
		assert.equal(assertUserRole('GENERAL_MANAGER'), 'GENERAL_MANAGER');
		assert.equal(assertCanonicalUserRole('ADMINISTRATOR'), 'ADMINISTRATOR');
	});

	it('rejects non-canonical values in strict mode', () => {
		assert.throws(
			() => parseUserRole(' manager '),
			(error: unknown) => {
				assert.ok(error instanceof DomainValidationError);
				assert.equal(error.context?.reason, 'non_canonical_input');
				return true;
			},
		);

		assert.throws(() => assertUserRole('administrator'), DomainValidationError);
	});

	it('has deterministic predicates for canonical checks', () => {
		assert.equal(isUserRole('MANAGER'), true);
		assert.equal(isCanonicalUserRole('MANAGER'), true);
		assert.equal(isUserRole(' manager '), false);
		assert.equal(isCanonicalUserRole(' manager '), false);
		assert.equal(isUserRole(undefined), false);
		assert.equal(isCanonicalUserRole(null), false);
	});
});
