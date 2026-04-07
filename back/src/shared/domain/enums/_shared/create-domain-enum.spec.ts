import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DomainValidationError } from '../../errors/domain-validation.error.js';
import { createDomainEnum } from './create-domain-enum.js';

describe('createDomainEnum', () => {
	it('parses valid canonical values', () => {
		const enumFactory = createDomainEnum({
			code: 'enum.test.invalid_value',
			label: 'Test enum',
			values: ['OPEN', 'CLOSED'] as const,
		});

		assert.equal(enumFactory.parse('OPEN'), 'OPEN');
		assert.equal(enumFactory.parseCanonical('CLOSED'), 'CLOSED');
	});

	it('throws DomainValidationError for non-string input', () => {
		const enumFactory = createDomainEnum({
			code: 'enum.test.invalid_value',
			label: 'Test enum',
			values: ['OPEN', 'CLOSED'] as const,
		});

		assert.throws(
			() => enumFactory.parse(undefined),
			(error: unknown) => {
				assert.ok(error instanceof DomainValidationError);
				assert.equal(error.code, 'enum.test.invalid_value');
				assert.equal(error.context?.reason, 'non_string_input');
				return true;
			},
		);
	});

	it('keeps assert semantics aligned with parse', () => {
		const enumFactory = createDomainEnum({
			code: 'enum.test.invalid_value',
			label: 'Test enum',
			values: ['OPEN', 'CLOSED'] as const,
		});

		assert.equal(enumFactory.assert('OPEN'), enumFactory.parse('OPEN'));
		assert.throws(() => enumFactory.assert('INVALID'), DomainValidationError);
	});

	it('enforces canonical input when allowNormalization is false', () => {
		const enumFactory = createDomainEnum({
			code: 'enum.test.invalid_value',
			label: 'Test enum',
			values: ['OPEN', 'CLOSED'] as const,
			allowNormalization: false,
		});

		assert.equal(enumFactory.parse('OPEN'), 'OPEN');
		assert.throws(
			() => enumFactory.parse(' open '),
			(error: unknown) => {
				assert.ok(error instanceof DomainValidationError);
				assert.equal(error.context?.reason, 'non_canonical_input');
				return true;
			},
		);
	});

	it('accepts normalized input when allowNormalization is true', () => {
		const enumFactory = createDomainEnum({
			code: 'enum.test.invalid_value',
			label: 'Test enum',
			values: ['OPEN', 'CLOSED'] as const,
			allowNormalization: true,
		});

		assert.equal(enumFactory.parse(' open '), 'OPEN');
		assert.equal(enumFactory.assert('closed'), 'CLOSED');
	});

	it('rejects enum configurations with duplicate values', () => {
		assert.throws(
			() =>
				createDomainEnum({
					code: 'enum.test.invalid_value',
					label: 'Test enum',
					values: ['OPEN', 'OPEN'] as const,
				}),
			(error: unknown) => {
				assert.ok(error instanceof Error);
				assert.match(error.message, /duplicated values/i);
				return true;
			},
		);
	});

	it('rejects enum configurations with normalization collisions', () => {
		assert.throws(
			() =>
				createDomainEnum({
					code: 'enum.test.invalid_value',
					label: 'Test enum',
					values: ['OPEN', ' OPEN '] as const,
				}),
			(error: unknown) => {
				assert.ok(error instanceof Error);
				assert.match(error.message, /canonical format/i);
				return true;
			},
		);
	});
});
