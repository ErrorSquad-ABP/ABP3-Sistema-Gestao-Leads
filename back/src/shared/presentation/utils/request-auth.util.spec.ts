import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { describe, it } from 'node:test';
import type { Request } from 'express';

import {
	extractAccessTokenFromRequest,
	extractRefreshTokenFromRequest,
} from './request-auth.util.js';

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

	it('refresh: corpo prevalece sobre cookie', () => {
		const fromBody = randomUUID();
		const fromCookie = randomUUID();
		const req = {
			body: { refreshToken: fromBody },
			cookies: { refresh_token: fromCookie },
		} as unknown as Request;
		assert.equal(
			extractRefreshTokenFromRequest(req, 'refresh_token'),
			fromBody,
		);
	});

	it('refresh: stash do middleware prevalece sobre cookie', () => {
		const stashed = randomUUID();
		const fromCookie = randomUUID();
		const req = {
			authRefreshTokenFromBody: stashed,
			body: {},
			cookies: { refresh_token: fromCookie },
		} as unknown as Request;
		assert.equal(extractRefreshTokenFromRequest(req, 'refresh_token'), stashed);
	});

	it('refresh: usa cookie se não houver corpo', () => {
		const inner = randomUUID();
		const req = {
			body: {},
			cookies: { rt: `  ${inner}  ` },
		} as unknown as Request;
		assert.equal(extractRefreshTokenFromRequest(req, 'rt'), inner);
	});
});
