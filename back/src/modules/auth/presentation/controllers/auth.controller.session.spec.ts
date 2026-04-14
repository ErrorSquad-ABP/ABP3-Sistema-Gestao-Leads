import 'reflect-metadata';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Request } from 'express';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../users/domain/errors/user-not-found.error.js';
import { AuthController } from './auth.controller.js';

const VALID_ARGON2_FIXTURE =
	'$argon2id$v=19$m=19456,t=2,p=1$H5K4T/9lCdJ1rPy/qic1Iw$FxSLF4hsA96bMKbhvKfu/V2rNzhVOH9YGJdkYyqbyXA';

function makeRequest(
	partial: Partial<Request> & { cookies?: Record<string, string> },
): Request {
	return {
		headers: {},
		cookies: {},
		...partial,
	} as Request;
}

describe('AuthController.session', () => {
	const authConfig = { cookieAccessName: 'access_token' } as const;

	const unused = {} as never;

	it('devolve null sem Bearer nem cookie de access', async () => {
		const controller = new AuthController(
			authConfig as never,
			{
				verifyAccessToken: async () => {
					throw new Error('must not verify');
				},
			} as never,
			unused,
			unused,
			unused,
			unused,
			{
				execute: async () => {
					throw new Error('must not find user');
				},
			} as never,
			unused,
			unused,
		);
		const out = await controller.session(
			makeRequest({ headers: {}, cookies: {} }),
		);
		assert.equal(out, null);
	});

	it('devolve null quando verifyAccessToken falha', async () => {
		const controller = new AuthController(
			authConfig as never,
			{
				verifyAccessToken: async () => {
					throw new Error('invalid jwt');
				},
			} as never,
			unused,
			unused,
			unused,
			unused,
			{
				execute: async () => {
					throw new Error('must not find user');
				},
			} as never,
			unused,
			unused,
		);
		const out = await controller.session(
			makeRequest({
				headers: { authorization: 'Bearer x.y.z' },
				cookies: {},
			}),
		);
		assert.equal(out, null);
	});

	it('devolve null quando o payload não é access', async () => {
		const controller = new AuthController(
			authConfig as never,
			{
				verifyAccessToken: async () =>
					({
						typ: 'refresh',
						sub: '00000000-0000-4000-8000-000000000001',
						jti: 'j',
						role: 'ATTENDANT',
					}) as never,
			} as never,
			unused,
			unused,
			unused,
			unused,
			{
				execute: async () => {
					throw new Error('must not find user');
				},
			} as never,
			unused,
			unused,
		);
		const out = await controller.session(
			makeRequest({ headers: { authorization: 'Bearer valid' }, cookies: {} }),
		);
		assert.equal(out, null);
	});

	it('devolve null quando o utilizador não existe', async () => {
		const uid = '00000000-0000-4000-8000-000000000071';
		const controller = new AuthController(
			authConfig as never,
			{
				verifyAccessToken: async () => ({
					typ: 'access' as const,
					sub: uid,
					jti: 'jti-s',
					role: 'ATTENDANT',
				}),
			} as never,
			unused,
			unused,
			unused,
			unused,
			{
				execute: async () => {
					throw new UserNotFoundError(uid);
				},
			} as never,
			unused,
			unused,
		);
		const out = await controller.session(
			makeRequest({
				cookies: { access_token: 'tok' },
				headers: {},
			}),
		);
		assert.equal(out, null);
	});

	it('devolve UserResponseDto quando o token e o utilizador são válidos', async () => {
		const uid = '00000000-0000-4000-8000-000000000072';
		const user = new User(
			Uuid.parse(uid),
			Name.create('Ana'),
			Email.create('ana@example.com'),
			PasswordHash.create(VALID_ARGON2_FIXTURE),
			'MANAGER',
			null,
			null,
			null,
		);
		const controller = new AuthController(
			authConfig as never,
			{
				verifyAccessToken: async () => ({
					typ: 'access' as const,
					sub: uid,
					jti: 'jti-ok',
					role: 'MANAGER',
				}),
			} as never,
			unused,
			unused,
			unused,
			unused,
			{
				execute: async (id: string) => {
					assert.equal(id, uid);
					return user;
				},
			} as never,
			unused,
			unused,
		);
		const out = await controller.session(
			makeRequest({ headers: { authorization: 'Bearer jwt' }, cookies: {} }),
		);
		assert.deepEqual(out, {
			accessGroup: null,
			accessGroupId: null,
			id: uid,
			name: 'Ana',
			email: 'ana@example.com',
			role: 'MANAGER',
			teamId: null,
		});
	});
});
