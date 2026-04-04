import type { Request } from 'express';

/** Extrai `Authorization: Bearer <token>`. */
function extractBearerToken(req: Request): string | undefined {
	const authz = req.headers.authorization;
	if (typeof authz !== 'string' || !authz.startsWith('Bearer ')) {
		return undefined;
	}
	const t = authz.slice(7).trim();
	return t.length > 0 ? t : undefined;
}

/**
 * Access: Bearer tem prioridade sobre cookie (evita cookie antigo sombrear access novo).
 * Nome do cookie vem de AUTH_CONFIG (servidor), não de input do cliente.
 */
function extractAccessTokenFromRequest(
	req: Request,
	cookieAccessName: string,
): string | undefined {
	const fromBearer = extractBearerToken(req);
	if (fromBearer !== undefined) {
		return fromBearer;
	}
	// eslint-disable-next-line security/detect-object-injection -- chave fixa por deploy (AUTH_CONFIG)
	const c = req.cookies?.[cookieAccessName];
	if (typeof c === 'string') {
		const t = c.trim();
		return t.length > 0 ? t : undefined;
	}
	return undefined;
}

function headerXRefreshToken(req: Request): string | undefined {
	const raw = req.headers['x-refresh-token'];
	const v =
		typeof raw === 'string'
			? raw.trim()
			: Array.isArray(raw)
				? raw[0]?.trim()
				: undefined;
	return v !== undefined && v.length > 0 ? v : undefined;
}

/**
 * Refresh: cookie → `X-Refresh-Token` → Bearer.
 * `bodyRefresh` só em fluxos que aceitam corpo (ex.: logout), sempre por último.
 */
function extractRefreshTokenFromRequest(
	req: Request,
	cookieRefreshName: string,
	bodyRefresh?: string | undefined,
): string | undefined {
	// eslint-disable-next-line security/detect-object-injection -- chave fixa por deploy (AUTH_CONFIG)
	const fromCookie = req.cookies?.[cookieRefreshName];
	const cookieStr =
		typeof fromCookie === 'string' && fromCookie.trim().length > 0
			? fromCookie.trim()
			: undefined;
	const fromX = headerXRefreshToken(req);
	const fromBearer = extractBearerToken(req);
	const fromBody =
		typeof bodyRefresh === 'string' && bodyRefresh.trim().length > 0
			? bodyRefresh.trim()
			: undefined;
	return cookieStr ?? fromX ?? fromBearer ?? fromBody;
}

export {
	extractAccessTokenFromRequest,
	extractBearerToken,
	extractRefreshTokenFromRequest,
};
