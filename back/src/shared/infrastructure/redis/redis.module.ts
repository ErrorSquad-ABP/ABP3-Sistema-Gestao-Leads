import { Global, Module } from '@nestjs/common';

import { loadRedisUrl } from '../../../config/redis-url.js';
import { RedisService } from './redis.service.js';
import { REDIS_URL_TOKEN } from './redis-url.token.js';

@Global()
@Module({
	providers: [
		{
			provide: REDIS_URL_TOKEN,
			useFactory: () => loadRedisUrl(),
		},
		RedisService,
	],
	exports: [RedisService, REDIS_URL_TOKEN],
})
class RedisModule {}

export { RedisModule };
