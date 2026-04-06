import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { AuthSessionPrismaRepository } from './auth-session.prisma-repository.js';

describe('AuthSessionPrismaRepository', () => {
	it('createSession serializa por user e aplica corte determinístico', async () => {
		const authConfig = {
			refreshTtlSeconds: 7 * 24 * 60 * 60,
			maxActiveSessionsPerUser: 2,
			refreshTokenPepper: '',
		};

		const calls: Array<{ sql: string }> = [];
		const tx = {
			$queryRaw: mock.fn(async (strings: TemplateStringsArray) => {
				calls.push({ sql: strings.join('') });
				return [];
			}),
			authSession: {
				create: mock.fn(async () => ({})),
			},
		};

		const prisma = {
			$transaction: mock.fn(
				async (fn: (txArg: typeof tx) => Promise<unknown>) => fn(tx),
			),
		};

		const repo = new AuthSessionPrismaRepository(
			prisma as never,
			authConfig as never,
		);
		await repo.createSession({
			userId: '00000000-0000-4000-8000-000000000042',
			userAgent: undefined,
			ipAddress: undefined,
		});

		assert.ok(
			calls.some((c) => c.sql.includes('pg_advisory_xact_lock')),
			'expected advisory lock query',
		);
		assert.ok(
			calls.some((c) => c.sql.includes('ROW_NUMBER()')),
			'expected deterministic cutoff query',
		);
	});

	it('rotateRefreshToken atualiza expiresAt (sliding window)', async () => {
		const authConfig = {
			refreshTtlSeconds: 7 * 24 * 60 * 60,
			maxActiveSessionsPerUser: 0,
			refreshTokenPepper: '',
		};

		const captured: Array<{ sql: string }> = [];
		const tx = {
			$queryRaw: mock.fn(async (strings: TemplateStringsArray) => {
				captured.push({ sql: strings.join('') });
				return [{ userId: 'u1' }];
			}),
			authSession: {
				update: mock.fn(async () => ({})),
			},
		};

		const prisma = {
			$transaction: mock.fn(
				async (fn: (txArg: typeof tx) => Promise<unknown>) => fn(tx),
			),
		};

		const repo = new AuthSessionPrismaRepository(
			prisma as never,
			authConfig as never,
		);
		await repo.rotateRefreshToken(
			'00000000-0000-4000-8000-000000000042.secretbase64urlAAAAAAAAAAAAAAAAAAAAAAAAAAA',
			{},
		);

		assert.ok(
			captured.some((c) => c.sql.includes('"expiresAt" =')),
			'expected rotation query to update expiresAt',
		);
	});
});
