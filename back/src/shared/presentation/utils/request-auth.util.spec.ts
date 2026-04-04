import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Request } from 'express';

import {
	extractAccessTokenFromRequest,
	extractRefreshTokenFromRequest,
} from './request-auth.util.js';

describe('request-auth.util', () => {
	it('access: Bearer prevalece sobre cookie', () => {
		const req = {
			headers: { authorization: 'Bearer from-header' },
			cookies: { access_token: 'from-cookie' },
		} as unknown as Request;
		assert.equal(
			extractAccessTokenFromRequest(req, 'access_token'),
			'from-header',
		);
	});

	it('access: usa cookie se não houver Bearer', () => {
		const req = {
			headers: {},
			cookies: { access_token: '  tok  ' },
		} as unknown as Request;
		assert.equal(extractAccessTokenFromRequest(req, 'access_token'), 'tok');
	});

	it('refresh: cookie → X-Refresh-Token → Bearer → corpo', () => {
		const base = {
			cookies: { r: 'c' },
			headers: { 'x-refresh-token': 'x', authorization: 'Bearer b' },
		} as unknown as Request;
		assert.equal(extractRefreshTokenFromRequest(base, 'r'), 'c');

		const noCookie = {
			cookies: {},
			headers: { 'x-refresh-token': 'x', authorization: 'Bearer b' },
		} as unknown as Request;
		assert.equal(extractRefreshTokenFromRequest(noCookie, 'r'), 'x');

		const onlyBearer = {
			cookies: {},
			headers: { authorization: 'Bearer b' },
		} as unknown as Request;
		assert.equal(extractRefreshTokenFromRequest(onlyBearer, 'r'), 'b');

		const bodyLast = {
			cookies: {},
			headers: {},
		} as unknown as Request;
		assert.equal(
			extractRefreshTokenFromRequest(bodyLast, 'r', '  body  '),
			'body',
		);
	});
});
