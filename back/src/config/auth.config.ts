/**
 * Configuração JWT (RS256) para auth stateless (apenas access token).
 * PEM em uma linha no .env: use `\n` para quebras de linha literais.
 */
function normalizePem(value: string): string {
	return value.replace(/\\n/g, '\n').trim();
}

function parseDurationToSeconds(spec: string): number {
	const m = /^(\d+)(s|m|h|d)$/i.exec(spec.trim());
	if (!m) {
		return 60 * 60;
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

function parseCookieSameSite(): 'lax' | 'strict' | 'none' {
	const raw = process.env.AUTH_COOKIE_SAMESITE?.trim().toLowerCase();
	if (raw === 'strict') {
		return 'strict';
	}
	if (raw === 'none') {
		return 'none';
	}
	return 'lax';
}

type AuthConfig = {
	readonly accessPrivateKey: string;
	readonly accessPublicKey: string;
	readonly accessExpiresIn: string;
	readonly accessTtlSeconds: number;
	readonly issuer: string;
	/** Se definido, incluído em sign/verify JWT (`aud`). */
	readonly audience: string | undefined;
	readonly frontendOrigins: readonly string[];
	readonly cookieAccessName: string;
	/** `SameSite` dos cookies auth (`lax` padrão; `strict` endurece CSRF; `none` exige `secure`). */
	readonly cookieSameSite: 'lax' | 'strict' | 'none';
	readonly rateLimitLoginMaxAttempts: number;
	readonly rateLimitLoginWindowSeconds: number;
};

function loadAuthConfig(): AuthConfig {
	const accessPrivateKey = normalizePem(
		process.env.JWT_ACCESS_PRIVATE_KEY ?? '',
	);
	const accessPublicKey = normalizePem(process.env.JWT_ACCESS_PUBLIC_KEY ?? '');

	const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES ?? '1h';

	const audienceRaw = process.env.JWT_AUDIENCE?.trim();
	const audience = audienceRaw ? audienceRaw : undefined;

	return {
		accessPrivateKey,
		accessPublicKey,
		accessExpiresIn,
		accessTtlSeconds: parseDurationToSeconds(accessExpiresIn),
		issuer: process.env.JWT_ISSUER ?? 'abp3-leads-api',
		audience,
		frontendOrigins: (process.env.FRONTEND_ORIGINS ?? 'http://localhost:3000')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean),
		cookieAccessName: process.env.AUTH_COOKIE_ACCESS ?? 'access_token',
		cookieSameSite: parseCookieSameSite(),
		rateLimitLoginMaxAttempts: parsePositiveInt(
			process.env.AUTH_RATE_LIMIT_LOGIN_MAX,
			30,
		),
		rateLimitLoginWindowSeconds: parsePositiveInt(
			process.env.AUTH_RATE_LIMIT_LOGIN_WINDOW_SEC,
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

/** Em produção, `aud` fixo reduz reuso acidental de tokens entre serviços. */
function assertProductionJwtAudience(config: AuthConfig): void {
	const nodeEnv = process.env.NODE_ENV ?? 'development';
	if (nodeEnv === 'production' && !config.audience) {
		throw new Error(
			'JWT_AUDIENCE é obrigatório quando NODE_ENV=production (claim aud em sign/verify).',
		);
	}
}

export type { AuthConfig };
export {
	assertAuthKeysConfigured,
	assertProductionJwtAudience,
	loadAuthConfig,
	parseDurationToSeconds,
};
