import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import type { AuthConfig } from '../../../config/auth.config.js';
import { AUTH_CONFIG } from '../../../config/auth-injection.token.js';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { RedisService } from '../../../shared/infrastructure/redis/redis.service.js';

@Injectable()
class AuthRateLimiterService {
	constructor(
		private readonly redis: RedisService,
		@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig,
	) {}

	async consumeLoginAttempt(bucketKeyHash: string): Promise<void> {
		await this.consume(
			`rl:auth:login:${bucketKeyHash}`,
			this.authConfig.rateLimitLoginMaxAttempts,
			this.authConfig.rateLimitLoginWindowSeconds,
		);
	}

	async consumeRefreshAttempt(bucketKeyHash: string): Promise<void> {
		await this.consume(
			`rl:auth:refresh:${bucketKeyHash}`,
			this.authConfig.rateLimitRefreshMaxAttempts,
			this.authConfig.rateLimitRefreshWindowSeconds,
		);
	}

	private async consume(
		key: string,
		maxAttempts: number,
		windowSeconds: number,
	): Promise<void> {
		const n = await this.redis.incr(key);
		if (n === 1) {
			await this.redis.expire(key, windowSeconds);
		}
		if (n > maxAttempts) {
			throw new HttpException(
				'Muitas requisições. Aguarde e tente novamente.',
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}
	}
}

export { AuthRateLimiterService };
