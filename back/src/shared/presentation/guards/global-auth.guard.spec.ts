import 'reflect-metadata';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	type ExecutionContext,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { GlobalAuthGuard } from './global-auth.guard.js';

type MockReq = {
	readonly path: string;
	readonly url?: string;
	headers: { authorization?: string };
	cookies?: Record<string, string>;
	user?: { userId: string; role: string; jti: string };
};

function mockContext(
	req: MockReq,
	handler: object,
	cls: object,
): ExecutionContext {
	return {
		switchToHttp: () => ({
			getRequest: () => req,
		}),
		getHandler: () => handler,
		getClass: () => cls,
	} as unknown as ExecutionContext;
}

describe('GlobalAuthGuard', () => {
	it('lança Unauthorized sem Bearer nem cookie', async () => {
		const reflector = new Reflector();
		const tokens = {
			verifyAccessToken: async () => {
				throw new Error('should not call');
			},
		};
		const sessions = { isJtiBlacklisted: async () => false };
		const authConfig = { cookieAccessName: 'access_token' };
		const guard = new GlobalAuthGuard(
			reflector,
			tokens as never,
			sessions as never,
			authConfig as never,
		);
		class H {}
		const handler = () => undefined;
		const req: MockReq = { path: '/api/x', headers: {} };
		await assert.rejects(
			guard.canActivate(mockContext(req, handler, H)),
			UnauthorizedException,
		);
	});

	it('define req.user quando o token é válido e não há @Roles', async () => {
		const reflector = new Reflector();
		const tokens = {
			verifyAccessToken: async () => ({
				typ: 'access' as const,
				sub: 'u1',
				role: 'ATTENDANT',
				jti: 'j1',
			}),
		};
		const sessions = { isJtiBlacklisted: async () => false };
		const authConfig = { cookieAccessName: 'access_token' };
		const guard = new GlobalAuthGuard(
			reflector,
			tokens as never,
			sessions as never,
			authConfig as never,
		);
		class H {}
		const handler = () => undefined;
		const req: MockReq = {
			path: '/api/x',
			headers: { authorization: 'Bearer tok' },
		};
		const ok = await guard.canActivate(mockContext(req, handler, H));
		assert.equal(ok, true);
		assert.deepEqual(req.user, {
			userId: 'u1',
			role: 'ATTENDANT',
			jti: 'j1',
		});
	});

	it('exige papel quando @Roles está no handler', async () => {
		const reflector = new Reflector();
		const tokens = {
			verifyAccessToken: async () => ({
				typ: 'access' as const,
				sub: 'u1',
				role: 'ATTENDANT',
				jti: 'j1',
			}),
		};
		const sessions = { isJtiBlacklisted: async () => false };
		const authConfig = { cookieAccessName: 'access_token' };
		const guard = new GlobalAuthGuard(
			reflector,
			tokens as never,
			sessions as never,
			authConfig as never,
		);
		class H {}
		const handler = () => undefined;
		Reflect.defineMetadata(ROLES_KEY, ['ADMINISTRATOR'], handler);
		const req: MockReq = {
			path: '/api/x',
			headers: { authorization: 'Bearer tok' },
		};
		await assert.rejects(
			guard.canActivate(mockContext(req, handler, H)),
			ForbiddenException,
		);
		const tokensAdmin = {
			verifyAccessToken: async () => ({
				typ: 'access' as const,
				sub: 'u1',
				role: 'ADMINISTRATOR',
				jti: 'j1',
			}),
		};
		const guardAdmin = new GlobalAuthGuard(
			reflector,
			tokensAdmin as never,
			sessions as never,
			authConfig as never,
		);
		const req2: MockReq = {
			path: '/api/x',
			headers: { authorization: 'Bearer tok' },
		};
		assert.equal(
			await guardAdmin.canActivate(mockContext(req2, handler, H)),
			true,
		);
	});
});
