import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { AuthConfig } from '../../../config/auth.config.js';
import { AUTH_CONFIG } from '../../../config/auth-injection.token.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import type { TransactionContext } from '../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest injeta instância em runtime
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service.js';
import { RefreshTokenInvalidError } from '../domain/errors/refresh-token-invalid.error.js';
import {
	buildRefreshToken,
	generateRefreshSecret,
	hashRefreshSecret,
	parseRefreshToken,
} from './opaque-refresh-token.util.js';

type CreateSessionInput = {
	readonly userId: string;
	readonly userAgent: string | undefined;
	readonly ipAddress: string | undefined;
};

function advisoryKeysFromUuid(uuid: string): {
	readonly k1: number;
	readonly k2: number;
} {
	// UUID canonical: 8-4-4-4-12 (hex). Usamos duas palavras de 32 bits estáveis (sem hash),
	// para evitar colisões teóricas de `hashtext()` no lock.
	const hex = uuid.replaceAll('-', '').toLowerCase();
	if (!/^[0-9a-f]{32}$/.test(hex)) {
		// Fallback: entradas inválidas não devem acontecer (userId vem do domínio/DB).
		// Usar um lock global aqui seria pior; preferimos falhar cedo.
		throw new Error(`userId inválido para advisory lock: ${uuid}`);
	}
	const a = Number.parseInt(hex.slice(0, 8), 16) | 0;
	const b = Number.parseInt(hex.slice(24, 32), 16) | 0;
	return { k1: a, k2: b };
}

@Injectable()
class AuthSessionPrismaRepository {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig,
	) {}

	private pepper(): string {
		return this.authConfig.refreshTokenPepper;
	}

	private db(
		transactionContext?: TransactionContext,
	): PrismaService | Prisma.TransactionClient {
		if (transactionContext !== undefined) {
			return transactionContext.client as Prisma.TransactionClient;
		}
		return this.prisma;
	}

	async getUserIdByValidRefreshToken(rawRefreshToken: string): Promise<string> {
		const parsed = parseRefreshToken(rawRefreshToken);
		if (parsed === null) {
			throw new RefreshTokenInvalidError();
		}
		const hash = hashRefreshSecret(parsed.secret, this.pepper());
		const now = new Date();
		const session = await this.prisma.authSession.findFirst({
			where: {
				id: parsed.sessionId,
				refreshTokenHash: hash,
				revokedAt: null,
				expiresAt: { gt: now },
			},
			select: { userId: true },
		});
		if (session === null) {
			throw new RefreshTokenInvalidError();
		}
		return session.userId;
	}

	async createSession(input: CreateSessionInput): Promise<{
		readonly refreshToken: string;
	}> {
		const sessionId = randomUUID();
		const secret = generateRefreshSecret();
		const refreshTokenHash = hashRefreshSecret(secret, this.pepper());
		const expiresAt = new Date(
			Date.now() + this.authConfig.refreshTtlSeconds * 1000,
		);
		const max = this.authConfig.maxActiveSessionsPerUser;
		await this.prisma.$transaction(async (tx) => {
			// Serialize criação/limpeza por utilizador para evitar race em burst de logins.
			// Advisory lock evita depender do nome da tabela `User` no Postgres.
			const keys = advisoryKeysFromUuid(input.userId);
			await tx.$queryRaw`SELECT pg_advisory_xact_lock(${keys.k1}::int, ${keys.k2}::int)`;

			await tx.authSession.create({
				data: {
					id: sessionId,
					userId: input.userId,
					refreshTokenHash,
					expiresAt,
					userAgent: input.userAgent ?? null,
					ipAddress: input.ipAddress ?? null,
				},
			});

			if (max > 0) {
				const now = new Date();
				await tx.$queryRaw`
					WITH ranked AS (
						SELECT
							"id",
							ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) AS rn
						FROM "auth_sessions"
						WHERE
							"userId" = ${input.userId}
							AND "revokedAt" IS NULL
							AND "expiresAt" > ${now}
					)
					UPDATE "auth_sessions"
					SET "revokedAt" = ${now}
					WHERE "id" IN (SELECT "id" FROM ranked WHERE rn > ${max})
				`;
			}
		});
		return { refreshToken: buildRefreshToken(sessionId, secret) };
	}

	/**
	 * Rotação atómica: só um pedido ganha com o hash antigo (deteção de reuso).
	 */
	async rotateRefreshToken(
		rawRefreshToken: string,
		meta: { readonly userAgent?: string; readonly ipAddress?: string },
	): Promise<{
		readonly userId: string;
		readonly refreshToken: string;
	}> {
		const parsed = parseRefreshToken(rawRefreshToken);
		if (parsed === null) {
			throw new RefreshTokenInvalidError();
		}
		const oldHash = hashRefreshSecret(parsed.secret, this.pepper());
		const newSecret = generateRefreshSecret();
		const newHash = hashRefreshSecret(newSecret, this.pepper());
		const now = new Date();
		const newExpiresAt = new Date(
			now.getTime() + this.authConfig.refreshTtlSeconds * 1000,
		);

		return this.prisma.$transaction(async (tx) => {
			const rows = await tx.$queryRaw<Array<{ userId: string }>>`
				UPDATE "auth_sessions"
				SET
					"refreshTokenHash" = ${newHash},
					"lastUsedAt" = ${now},
					"expiresAt" = ${newExpiresAt}
				WHERE
					"id" = ${parsed.sessionId}
					AND "refreshTokenHash" = ${oldHash}
					AND "revokedAt" IS NULL
					AND "expiresAt" > ${now}
				RETURNING "userId"
			`;
			if (rows.length !== 1) {
				throw new RefreshTokenInvalidError();
			}
			const rotated = rows[0];
			if (rotated === undefined) {
				throw new RefreshTokenInvalidError();
			}
			if (meta.userAgent !== undefined || meta.ipAddress !== undefined) {
				await tx.authSession.update({
					where: { id: parsed.sessionId },
					data: {
						...(meta.userAgent !== undefined
							? { userAgent: meta.userAgent }
							: {}),
						...(meta.ipAddress !== undefined
							? { ipAddress: meta.ipAddress }
							: {}),
					},
				});
			}
			return {
				userId: rotated.userId,
				refreshToken: buildRefreshToken(parsed.sessionId, newSecret),
			};
		});
	}

	/**
	 * Revoga sessões de refresh ainda válidas (`expiresAt` futuro) e não revogadas.
	 * `transactionContext` alinha revogação com o mesmo commit do `users.update`.
	 */
	async revokeAllActiveSessionsForUser(
		userId: string,
		transactionContext?: TransactionContext,
	): Promise<void> {
		const now = new Date();
		await this.db(transactionContext).authSession.updateMany({
			where: {
				userId,
				revokedAt: null,
				expiresAt: { gt: now },
			},
			data: { revokedAt: now },
		});
	}

	/** Revoga sessão se o par id+hash bater; ignora se já revogada (logout idempotente). */
	async revokeByRefreshToken(rawRefreshToken: string): Promise<void> {
		const parsed = parseRefreshToken(rawRefreshToken);
		if (parsed === null) {
			return;
		}
		const oldHash = hashRefreshSecret(parsed.secret, this.pepper());
		const now = new Date();
		await this.prisma.authSession.updateMany({
			where: {
				id: parsed.sessionId,
				refreshTokenHash: oldHash,
				revokedAt: null,
			},
			data: { revokedAt: now },
		});
	}
}

export { AuthSessionPrismaRepository };
