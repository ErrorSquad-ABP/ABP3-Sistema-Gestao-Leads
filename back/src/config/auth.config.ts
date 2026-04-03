/**
 * Configuração JWT (RS256) e Redis para auth.
 * PEM em uma linha no .env: use `\n` para quebras de linha literais.
 */
function normalizePem(value: string): string {
	return value.replace(/\\n/g, '\n').trim();
}

function parseDurationToSeconds(spec: string): number {
	const m = /^(\d+)(s|m|h|d)$/i.exec(spec.trim());
	if (!m) {
		return 15 * 60;
	}
	const n = Number(m[1]);
	const u = (m[2] ?? 'm').toLowerCase();
	if (u === 's') {
		return n;
	}
	if (u === 'm') {
		return n * 60;
	}
	if (u === 'h') {
		return n * 3600;
	}
	return n * 86400;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
	if (value === undefined || value.trim() === '') {
		return fallback;
	}
	const n = Number.parseInt(value, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
}

type AuthConfig = {
	readonly accessPrivateKey: string;
	readonly accessPublicKey: string;
	readonly refreshPrivateKey: string;
	readonly refreshPublicKey: string;
	readonly accessExpiresIn: string;
	readonly refreshExpiresIn: string;
	readonly accessTtlSeconds: number;
	readonly refreshTtlSeconds: number;
	readonly issuer: string;
	/** Se definido, incluído em sign/verify JWT (`aud`). */
	readonly audience: string | undefined;
	readonly frontendOrigins: readonly string[];
	readonly cookieAccessName: string;
	readonly cookieRefreshName: string;
	readonly rateLimitLoginMaxAttempts: number;
	readonly rateLimitLoginWindowSeconds: number;
	readonly rateLimitRefreshMaxAttempts: number;
	readonly rateLimitRefreshWindowSeconds: number;
};

function loadAuthConfig(): AuthConfig {
	const accessPrivateKey = normalizePem(
		process.env.JWT_ACCESS_PRIVATE_KEY ?? '',
	);
	const accessPublicKey = normalizePem(process.env.JWT_ACCESS_PUBLIC_KEY ?? '');
	const refreshPrivateRaw = normalizePem(
		process.env.JWT_REFRESH_PRIVATE_KEY ?? '',
	);
	const refreshPublicRaw = normalizePem(
		process.env.JWT_REFRESH_PUBLIC_KEY ?? '',
	);
	const hasRefreshPriv = Boolean(refreshPrivateRaw);
	const hasRefreshPub = Boolean(refreshPublicRaw);
	if (hasRefreshPriv !== hasRefreshPub) {
		throw new Error(
			'Defina JWT_REFRESH_PRIVATE_KEY e JWT_REFRESH_PUBLIC_KEY em par, ou omita ambos para reutilizar as chaves de access.',
		);
	}
	const refreshPrivateKey = hasRefreshPriv
		? refreshPrivateRaw
		: accessPrivateKey;
	const refreshPublicKey = hasRefreshPub ? refreshPublicRaw : accessPublicKey;

	const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES ?? '15m';
	const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES ?? '7d';

	const audienceRaw = process.env.JWT_AUDIENCE?.trim();
	const audience = audienceRaw ? audienceRaw : undefined;

	return {
		accessPrivateKey,
		accessPublicKey,
		refreshPrivateKey,
		refreshPublicKey,
		accessExpiresIn,
		refreshExpiresIn,
		accessTtlSeconds: parseDurationToSeconds(accessExpiresIn),
		refreshTtlSeconds: parseDurationToSeconds(refreshExpiresIn),
		issuer: process.env.JWT_ISSUER ?? 'abp3-leads-api',
		audience,
		frontendOrigins: (process.env.FRONTEND_ORIGINS ?? 'http://localhost:3000')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean),
		cookieAccessName: process.env.AUTH_COOKIE_ACCESS ?? 'access_token',
		cookieRefreshName: process.env.AUTH_COOKIE_REFRESH ?? 'refresh_token',
		rateLimitLoginMaxAttempts: parsePositiveInt(
			process.env.AUTH_RATE_LIMIT_LOGIN_MAX,
			30,
		),
		rateLimitLoginWindowSeconds: parsePositiveInt(
			process.env.AUTH_RATE_LIMIT_LOGIN_WINDOW_SEC,
			60,
		),
		rateLimitRefreshMaxAttempts: parsePositiveInt(
			process.env.AUTH_RATE_LIMIT_REFRESH_MAX,
			60,
		),
		rateLimitRefreshWindowSeconds: parsePositiveInt(
			process.env.AUTH_RATE_LIMIT_REFRESH_WINDOW_SEC,
			60,
		),
	};
}

function assertAuthKeysConfigured(config: AuthConfig): void {
	if (!config.accessPrivateKey || !config.accessPublicKey) {
		throw new Error(
			'JWT_ACCESS_PRIVATE_KEY e JWT_ACCESS_PUBLIC_KEY são obrigatórios (par RSA PEM). Gere com: openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem',
		);
	}
}

export type { AuthConfig };
export { assertAuthKeysConfigured, loadAuthConfig, parseDurationToSeconds };
