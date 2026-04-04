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

export { extractAccessTokenFromRequest, extractBearerToken };
