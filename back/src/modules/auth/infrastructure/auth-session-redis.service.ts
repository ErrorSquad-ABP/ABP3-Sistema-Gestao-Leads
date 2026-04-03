import { Inject, Injectable } from '@nestjs/common';

import type { AuthConfig } from '../../../config/auth.config.js';
import { AUTH_CONFIG } from '../../../config/auth-injection.token.js';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { RedisService } from '../../../shared/infrastructure/redis/redis.service.js';

const PREFIX_RF = 'auth:rf:';
const PREFIX_BL = 'auth:bl:';

@Injectable()
class AuthSessionRedisService {
	constructor(
		private readonly redis: RedisService,
		@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig,
	) {}

	refreshFamilyKey(familyId: string): string {
		return `${PREFIX_RF}${familyId}`;
	}

	blacklistKey(jti: string): string {
		return `${PREFIX_BL}${jti}`;
	}

	async setCurrentRefreshJti(
		familyId: string,
		refreshJti: string,
	): Promise<void> {
		await this.redis.setex(
			this.refreshFamilyKey(familyId),
			this.authConfig.refreshTtlSeconds,
			refreshJti,
		);
	}

	/**
	 * Troca atômica do jti de refresh na família (mitiga duas requisições paralelas com o mesmo refresh).
	 */
	async tryRotateRefreshJti(
		familyId: string,
		expectedCurrentJti: string,
		newRefreshJti: string,
	): Promise<'missing' | 'mismatch' | 'rotated'> {
		return this.redis.compareSetexIfValueMatches(
			this.refreshFamilyKey(familyId),
			expectedCurrentJti,
			newRefreshJti,
			this.authConfig.refreshTtlSeconds,
		);
	}

	async deleteRefreshFamily(familyId: string): Promise<void> {
		await this.redis.del(this.refreshFamilyKey(familyId));
	}

	async blacklistJti(jti: string, ttlSeconds: number): Promise<void> {
		if (ttlSeconds <= 0) {
			return;
		}
		await this.redis.setex(this.blacklistKey(jti), ttlSeconds, '1');
	}

	async isJtiBlacklisted(jti: string): Promise<boolean> {
		const v = await this.redis.get(this.blacklistKey(jti));
		return v !== null;
	}
}

export { AuthSessionRedisService };
