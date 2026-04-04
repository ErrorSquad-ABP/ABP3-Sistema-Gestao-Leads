import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import type { AuthConfig } from '../../../config/auth.config.js';
import { AUTH_CONFIG } from '../../../config/auth-injection.token.js';

type Bucket = { readonly windowStartMs: number; count: number };

/**
 * Rate limit só em memória (por processo). Adequado a escopo simples; em várias réplicas não é global.
 */
@Injectable()
class AuthRateLimiterService {
	private readonly buckets = new Map<string, Bucket>();

	constructor(@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig) {}

	consumeLoginAttempt(bucketKeyHash: string): void {
		this.consume(
			`login:${bucketKeyHash}`,
			this.authConfig.rateLimitLoginMaxAttempts,
			this.authConfig.rateLimitLoginWindowSeconds,
		);
	}

	private consume(
		key: string,
		maxAttempts: number,
		windowSeconds: number,
	): void {
		const now = Date.now();
		const windowMs = windowSeconds * 1000;
		let b = this.buckets.get(key);
		if (b === undefined || now - b.windowStartMs >= windowMs) {
			b = { windowStartMs: now, count: 0 };
			this.buckets.set(key, b);
		}
		b.count++;
		if (b.count > maxAttempts) {
			throw new HttpException(
				'Muitas requisições. Aguarde e tente novamente.',
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}
		if (this.buckets.size > 10_000) {
			this.pruneExpired(now, windowMs);
		}
	}

	private pruneExpired(now: number, maxWindowMs: number): void {
		for (const [k, b] of this.buckets) {
			if (now - b.windowStartMs > maxWindowMs * 2) {
				this.buckets.delete(k);
			}
		}
	}
}

export { AuthRateLimiterService };
