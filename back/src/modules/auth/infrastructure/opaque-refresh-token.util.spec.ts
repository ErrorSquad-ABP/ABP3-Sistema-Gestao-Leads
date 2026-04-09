import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	buildRefreshToken,
	hashRefreshSecret,
	parseRefreshToken,
} from './opaque-refresh-token.util.js';

describe('opaque-refresh-token.util', () => {
	it('parseRefreshToken: aceita uuid.secret', () => {
		const sid = '550e8400-e29b-41d4-a716-446655440000';
		const secret = 'a'.repeat(43);
		const raw = buildRefreshToken(sid, secret);
		const p = parseRefreshToken(raw);
		assert.ok(p);
		assert.equal(p.sessionId, sid);
		assert.equal(p.secret, secret);
	});

	it('parseRefreshToken: rejeita formato inválido', () => {
		assert.equal(parseRefreshToken(''), null);
		assert.equal(parseRefreshToken('nope'), null);
		assert.equal(parseRefreshToken(`${'x'.repeat(36)}.short`), null);
	});

	it('hashRefreshSecret: determinístico com mesmo pepper', () => {
		const a = hashRefreshSecret('sec', 'pep');
		const b = hashRefreshSecret('sec', 'pep');
		assert.equal(a, b);
		assert.equal(a.length, 64);
	});

	it('hashRefreshSecret: muda com pepper diferente', () => {
		assert.notEqual(
			hashRefreshSecret('sec', ''),
			hashRefreshSecret('sec', 'x'),
		);
	});
});
