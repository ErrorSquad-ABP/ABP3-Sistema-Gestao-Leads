/**
 * URL do Redis (infra). Independe de `AuthConfig` para não acoplar cache genérico a JWT.
 */
function loadRedisUrl(): string {
	return process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
}

export { loadRedisUrl };
