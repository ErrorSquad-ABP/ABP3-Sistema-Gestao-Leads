import type { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
	interface Request {
		/** Populated from JSON body before `refreshToken` is removed (evita vazar em logs de `req.body`). */
		authRefreshTokenFromBody?: string;
	}
}

const AUTH_REFRESH_PATHS = new Set(['/api/auth/refresh', '/api/auth/logout']);

/**
 * Remove `refreshToken` do corpo JSON após copiar para `req.authRefreshTokenFromBody`,
 * para que middlewares/proxies que loguem `req.body` não gravem o segredo.
 * O pipeline Nest continua a obter o valor via `extractRefreshTokenFromRequest`.
 */
function redactAuthRefreshBodyMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	if (req.method !== 'POST') {
		next();
		return;
	}
	const pathOnly = (req.path ?? '').split('?')[0] ?? '';
	if (!AUTH_REFRESH_PATHS.has(pathOnly)) {
		next();
		return;
	}
	const b = req.body;
	if (b !== null && typeof b === 'object' && 'refreshToken' in b) {
		const raw = (b as Record<string, unknown>).refreshToken;
		if (typeof raw === 'string' && raw.trim().length > 0) {
			req.authRefreshTokenFromBody = raw.trim();
			delete (b as Record<string, unknown>).refreshToken;
		}
	}
	next();
}

export { redactAuthRefreshBodyMiddleware };
