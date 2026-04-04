import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { describe, it } from 'node:test';
import type { Request } from 'express';

import { extractAccessTokenFromRequest } from './request-auth.util.js';

describe('request-auth.util', () => {
	it('access: Bearer prevalece sobre cookie', () => {
		const fromHeader = randomUUID();
		const fromCookie = randomUUID();
		const req = {
			headers: { authorization: `Bearer ${fromHeader}` },
			cookies: { access_token: fromCookie },
		} as unknown as Request;
		assert.equal(
			extractAccessTokenFromRequest(req, 'access_token'),
			fromHeader,
		);
	});

	it('access: usa cookie se não houver Bearer', () => {
		const inner = randomUUID();
		const req = {
			headers: {},
			cookies: { access_token: `  ${inner}  ` },
		} as unknown as Request;
		assert.equal(extractAccessTokenFromRequest(req, 'access_token'), inner);
	});
});
