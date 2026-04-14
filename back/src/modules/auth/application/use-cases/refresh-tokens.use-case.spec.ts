import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import { RefreshTokenInvalidError } from '../../domain/errors/refresh-token-invalid.error.js';
import { RefreshTokensUseCase } from './refresh-tokens.use-case.js';

const VALID_ARGON2_FIXTURE =
	'$argon2id$v=19$m=19456,t=2,p=1$H5K4T/9lCdJ1rPy/qic1Iw$FxSLF4hsA96bMKbhvKfu/V2rNzhVOH9YGJdkYyqbyXA';

describe('RefreshTokensUseCase', () => {
	it('emite access e refresh após rotação bem-sucedida', async () => {
		const user = new User(
			Uuid.parse('00000000-0000-4000-8000-000000000042'),
			Name.create('Test'),
			Email.create('t@example.com'),
			PasswordHash.create(VALID_ARGON2_FIXTURE),
			'ADMINISTRATOR',
			null,
			null,
			null,
		);
		const authSessions = {
			getUserIdByValidRefreshToken: mock.fn(async () => user.id.value),
			rotateRefreshToken: mock.fn(async () => ({
				refreshToken: `${user.id.value}.newsecretbase64urlAAAAAAAAAAAAAAAAAAAAAAAAAAA`,
			})),
		};
		const userRepositoryFactory = {
			create: () => ({
				findById: mock.fn(async () => user),
			}),
		};
		const tokens = {
			signAccessToken: mock.fn(async () => ({
				token: 'access-jwt',
				jti: 'jti-1',
			})),
		};
		const uc = new RefreshTokensUseCase(
			authSessions as never,
			userRepositoryFactory as never,
			tokens as never,
		);
		const raw = `${user.id.value}.oldsecretbase64urlAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
		const out = await uc.execute(raw, {});
		assert.equal(out.accessToken, 'access-jwt');
		assert.ok(out.refreshToken.includes('.'));
		assert.equal(
			authSessions.getUserIdByValidRefreshToken.mock.calls.length,
			1,
		);
		assert.equal(authSessions.rotateRefreshToken.mock.calls.length, 1);
		assert.equal(tokens.signAccessToken.mock.calls.length, 1);
	});

	it('lança RefreshTokenInvalidError se utilizador não existe', async () => {
		const uid = '00000000-0000-4000-8000-000000000099';
		const authSessions = {
			getUserIdByValidRefreshToken: mock.fn(async () => uid),
			rotateRefreshToken: mock.fn(async () => ({
				refreshToken: `${uid}.newsecretbase64urlAAAAAAAAAAAAAAAAAAAAAAAAAAA`,
			})),
		};
		const userRepositoryFactory = {
			create: () => ({
				findById: mock.fn(async () => null),
			}),
		};
		const tokens = {
			signAccessToken: mock.fn(async () => ({ token: 'x', jti: 'y' })),
		};
		const uc = new RefreshTokensUseCase(
			authSessions as never,
			userRepositoryFactory as never,
			tokens as never,
		);
		const raw = `${uid}.oldsecretbase64urlAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
		await assert.rejects(() => uc.execute(raw, {}), RefreshTokenInvalidError);
	});

	it('não consome a sessão se falhar ao assinar access token', async () => {
		const uid = '00000000-0000-4000-8000-000000000042';
		const authSessions = {
			getUserIdByValidRefreshToken: mock.fn(async () => uid),
			rotateRefreshToken: mock.fn(async () => ({
				refreshToken: `${uid}.newsecretbase64urlAAAAAAAAAAAAAAAAAAAAAAAAAAA`,
			})),
		};
		const userRepositoryFactory = {
			create: () => ({
				findById: mock.fn(async () => ({
					id: { value: uid },
				})),
			}),
		};
		const tokens = {
			signAccessToken: mock.fn(async () => {
				throw new Error('transient-sign-error');
			}),
		};
		const uc = new RefreshTokensUseCase(
			authSessions as never,
			userRepositoryFactory as never,
			tokens as never,
		);
		const raw = `${uid}.oldsecretbase64urlAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
		await assert.rejects(() => uc.execute(raw, {}));
		assert.equal(authSessions.rotateRefreshToken.mock.calls.length, 0);
	});
});
