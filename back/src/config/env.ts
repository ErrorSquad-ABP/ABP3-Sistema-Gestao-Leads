import { config as loadDotenv } from 'dotenv';

function loadEnvironmentFiles(): void {
	loadDotenv({ path: '.env' });
	loadDotenv({ override: true, path: '.env.local' });
}

loadEnvironmentFiles();

/**
 * `trust proxy` do Express: só confiar em X-Forwarded-For quando há reverse proxy
 * controlado. `false` = usar só o socket (cliente não pode forjar o IP para rate limit).
 * Número = saltos de proxy confiáveis (ex.: `1` atrás de um nginx).
 */
function parseTrustProxy(): false | number {
	const raw = process.env.TRUST_PROXY?.trim();
	if (raw === undefined || raw === '') {
		return false;
	}
	const lower = raw.toLowerCase();
	if (lower === 'false' || lower === '0' || lower === 'no') {
		return false;
	}
	const n = Number.parseInt(raw, 10);
	if (!Number.isNaN(n) && n > 0) {
		return n;
	}
	if (lower === 'true' || lower === 'yes' || lower === '1') {
		return 1;
	}
	return false;
}

const env = {
	appUrl: process.env.APP_URL ?? 'http://localhost:3001',
	databaseUrl: process.env.DATABASE_URL ?? '',
	hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
	hasJwtSecret: Boolean(process.env.JWT_SECRET),
	nodeEnv: process.env.NODE_ENV ?? 'development',
	port: Number.parseInt(process.env.PORT ?? '3001', 10),
	trustProxy: parseTrustProxy(),
};

export { env };
