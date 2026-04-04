import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';

import type { AuthConfig } from '../../../config/auth.config.js';
import { AUTH_CONFIG } from '../../../config/auth-injection.token.js';
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

@Injectable()
class AuthSessionPrismaRepository {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig,
	) {}

	private pepper(): string {
		return this.authConfig.refreshTokenPepper;
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
			if (max > 0) {
				const now = new Date();
				const activeCount = await tx.authSession.count({
					where: {
						userId: input.userId,
						revokedAt: null,
						expiresAt: { gt: now },
					},
				});
				if (activeCount >= max) {
					const oldest = await tx.authSession.findFirst({
						where: {
							userId: input.userId,
							revokedAt: null,
							expiresAt: { gt: now },
						},
						orderBy: { createdAt: 'asc' },
						select: { id: true },
					});
					if (oldest !== null) {
						await tx.authSession.update({
							where: { id: oldest.id },
							data: { revokedAt: now },
						});
					}
				}
			}
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

		return this.prisma.$transaction(async (tx) => {
			const rows = await tx.$queryRaw<Array<{ userId: string }>>`
				UPDATE "auth_sessions"
				SET
					"refreshTokenHash" = ${newHash},
					"lastUsedAt" = ${now}
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
