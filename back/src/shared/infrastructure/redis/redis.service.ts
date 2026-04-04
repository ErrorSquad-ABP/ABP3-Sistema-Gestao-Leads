import {
	Inject,
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';

import { REDIS_URL_TOKEN } from './redis-url.token.js';

/** Resultado de troca atômica: `rotated` ok; `mismatch` valor atual ≠ esperado; `missing` chave inexistente. */
type CompareSetexIfMatchResult = 'missing' | 'mismatch' | 'rotated';

@Injectable()
class RedisService implements OnModuleInit, OnModuleDestroy {
	private client!: Redis;

	constructor(@Inject(REDIS_URL_TOKEN) private readonly redisUrl: string) {}

	async onModuleInit(): Promise<void> {
		this.client = new Redis(this.redisUrl, { maxRetriesPerRequest: 3 });
		await this.client.ping();
	}

	async onModuleDestroy(): Promise<void> {
		await this.client.quit();
	}

	get redis(): Redis {
		return this.client;
	}

	async ping(): Promise<void> {
		const r = await this.client.ping();
		if (r !== 'PONG') {
			throw new Error(`Redis PING inesperado: ${String(r)}`);
		}
	}

	async setex(key: string, seconds: number, value: string): Promise<void> {
		await this.client.setex(key, seconds, value);
	}

	async get(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	async del(key: string): Promise<void> {
		await this.client.del(key);
	}

	async incr(key: string): Promise<number> {
		return this.client.incr(key);
	}

	async expire(key: string, seconds: number): Promise<void> {
		await this.client.expire(key, seconds);
	}

	/**
	 * `SETEX` só se o valor atual for exatamente `expectedValue` (evita corrida em refresh paralelo).
	 */
	async compareSetexIfValueMatches(
		key: string,
		expectedValue: string,
		newValue: string,
		ttlSeconds: number,
	): Promise<CompareSetexIfMatchResult> {
		const script = `
			local cur = redis.call('GET', KEYS[1])
			if cur == false then return 0 end
			if cur ~= ARGV[1] then return 1 end
			redis.call('SETEX', KEYS[1], tonumber(ARGV[3]), ARGV[2])
			return 2
		`;
		const raw = await this.client.eval(
			script,
			1,
			key,
			expectedValue,
			newValue,
			String(ttlSeconds),
		);
		const code = Number(raw);
		if (code === 2) {
			return 'rotated';
		}
		if (code === 1) {
			return 'mismatch';
		}
		return 'missing';
	}
}

export type { CompareSetexIfMatchResult };
export { RedisService };
