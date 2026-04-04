import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { AuthSessionRedisService } from '../../infrastructure/auth-session-redis.service.js';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { AuthTokenService } from '../../infrastructure/auth-token.service.js';

function blacklistTtlSeconds(exp?: number): number {
	if (typeof exp !== 'number') {
		return 0;
	}
	const now = Math.floor(Date.now() / 1000);
	return Math.max(0, exp - now);
}

@Injectable()
class LogoutUseCase {
	constructor(
		private readonly tokens: AuthTokenService,
		private readonly sessions: AuthSessionRedisService,
	) {}

	async execute(
		accessToken: string | undefined,
		refreshToken: string | undefined,
	): Promise<void> {
		await Promise.all([
			this.blacklistAccess(accessToken),
			this.blacklistRefresh(refreshToken),
		]);
	}

	private async blacklistAccess(token: string | undefined): Promise<void> {
		if (!token) {
			return;
		}
		try {
			const p = await this.tokens.verifyAccessToken(token);
			const ttl = blacklistTtlSeconds(p.exp);
			await this.sessions.blacklistJti(p.jti, ttl);
		} catch {
			/* Só blacklist com JWT verificado (evita decode sem assinatura). */
		}
	}

	private async blacklistRefresh(token: string | undefined): Promise<void> {
		if (!token) {
			return;
		}
		try {
			const p = await this.tokens.verifyRefreshToken(token);
			await this.sessions.deleteRefreshFamily(p.fam);
			const ttl = blacklistTtlSeconds(p.exp);
			await this.sessions.blacklistJti(p.jti, ttl);
		} catch {
			/* Só revoga refresh com assinatura válida. */
		}
	}
}

export { LogoutUseCase };
