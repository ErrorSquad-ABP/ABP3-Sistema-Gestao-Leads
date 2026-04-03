import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Email } from '../../../../shared/domain/value-objects/email.value-object.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { PasswordHash } from '../../../../shared/domain/value-objects/password-hash.value-object.js';
import type { FindUserUseCase } from '../../../users/application/use-cases/find-user.use-case.js';
import { User } from '../../../users/domain/entities/user.entity.js';
import { RefreshTokenInvalidError } from '../../domain/errors/refresh-token-invalid.error.js';
import type { AuthSessionRedisService } from '../../infrastructure/auth-session-redis.service.js';
import type { AuthTokenService } from '../../infrastructure/auth-token.service.js';
import { RefreshTokensUseCase } from './refresh-tokens.use-case.js';

const SAMPLE_HASH =
	'$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$9q4FC2S7w6zV8nQ8PjM4Ww';

function buildUser(): User {
	const id = Uuid.parse('11111111-1111-4111-8111-111111111111');
	return new User(
		id,
		Name.create('Admin'),
		Email.create('admin@example.com'),
		PasswordHash.create(SAMPLE_HASH),
		'ADMINISTRATOR',
		null,
	);
}

describe('RefreshTokensUseCase', () => {
	it('emite novos tokens quando a rotação atômica confirma', async () => {
		const user = buildUser();
		const tokens = {
			verifyRefreshToken: async () => ({
				sub: user.id.value,
				jti: 'old-jti',
				fam: 'fam-1',
				typ: 'refresh' as const,
				exp: 9999999999,
			}),
			signAccessToken: async () => ({ token: 'access-new', jti: 'a1' }),
			signRefreshToken: async () => ({ token: 'refresh-new', jti: 'new-jti' }),
		} satisfies Pick<
			AuthTokenService,
			'verifyRefreshToken' | 'signAccessToken' | 'signRefreshToken'
		>;

		const sessions = {
			tryRotateRefreshJti: async () => 'rotated' as const,
		} satisfies Pick<AuthSessionRedisService, 'tryRotateRefreshJti'>;

		const findUser = {
			execute: async (id: string) => {
				assert.equal(id, user.id.value);
				return user;
			},
		} satisfies Pick<FindUserUseCase, 'execute'>;

		const useCase = new RefreshTokensUseCase(
			tokens as unknown as AuthTokenService,
			sessions as unknown as AuthSessionRedisService,
			findUser as unknown as FindUserUseCase,
		);

		const out = await useCase.execute('any.jwt');
		assert.equal(out.accessToken, 'access-new');
		assert.equal(out.refreshToken, 'refresh-new');
		assert.equal(out.user.id.value, user.id.value);
	});

	it('lança quando Redis não encontra a família (missing)', async () => {
		const user = buildUser();
		const tokens = {
			verifyRefreshToken: async () => ({
				sub: user.id.value,
				jti: 'old-jti',
				fam: 'fam-x',
				typ: 'refresh' as const,
			}),
			signAccessToken: async () => ({ token: 'a', jti: 'a' }),
			signRefreshToken: async () => ({ token: 'r', jti: 'n' }),
		} satisfies Pick<
			AuthTokenService,
			'verifyRefreshToken' | 'signAccessToken' | 'signRefreshToken'
		>;

		const sessions = {
			tryRotateRefreshJti: async () => 'missing' as const,
		} satisfies Pick<AuthSessionRedisService, 'tryRotateRefreshJti'>;

		const findUser = {
			execute: async () => user,
		} satisfies Pick<FindUserUseCase, 'execute'>;

		const useCase = new RefreshTokensUseCase(
			tokens as unknown as AuthTokenService,
			sessions as unknown as AuthSessionRedisService,
			findUser as unknown as FindUserUseCase,
		);

		await assert.rejects(
			() => useCase.execute('jwt'),
			RefreshTokenInvalidError,
		);
	});

	it('lança quando o jti armazenado não bate (mismatch)', async () => {
		const user = buildUser();
		const tokens = {
			verifyRefreshToken: async () => ({
				sub: user.id.value,
				jti: 'stale-jti',
				fam: 'fam-y',
				typ: 'refresh' as const,
			}),
			signAccessToken: async () => ({ token: 'a', jti: 'a' }),
			signRefreshToken: async () => ({ token: 'r', jti: 'n' }),
		} satisfies Pick<
			AuthTokenService,
			'verifyRefreshToken' | 'signAccessToken' | 'signRefreshToken'
		>;

		const sessions = {
			tryRotateRefreshJti: async () => 'mismatch' as const,
		} satisfies Pick<AuthSessionRedisService, 'tryRotateRefreshJti'>;

		const findUser = {
			execute: async () => user,
		} satisfies Pick<FindUserUseCase, 'execute'>;

		const useCase = new RefreshTokensUseCase(
			tokens as unknown as AuthTokenService,
			sessions as unknown as AuthSessionRedisService,
			findUser as unknown as FindUserUseCase,
		);

		await assert.rejects(
			() => useCase.execute('jwt'),
			RefreshTokenInvalidError,
		);
	});
});
