import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { AuthConfig } from '../../../config/auth.config.js';
import { AUTH_CONFIG } from '../../../config/auth-injection.token.js';
// biome-ignore lint/style/useImportType: classes necessárias para DI (Nest)
import { AuthSessionRedisService } from '../../../modules/auth/infrastructure/auth-session-redis.service.js';
// biome-ignore lint/style/useImportType: classes necessárias para DI (Nest)
import { AuthTokenService } from '../../../modules/auth/infrastructure/auth-token.service.js';
import type { UserRole } from '../../domain/enums/user-role.enum.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { isOpenDocumentationPath } from '../utils/documentation-path.util.js';

type JwtUser = {
	readonly userId: string;
	readonly role: string;
	readonly jti: string;
};

function httpPath(req: Pick<Request, 'path' | 'url'>): string {
	const raw = req.path ?? req.url ?? '';
	return raw.split('?')[0] ?? raw;
}

/** Bearer tem prioridade sobre cookie (evita cookie antigo sombrear access novo). */
function extractAccessToken(
	req: Request,
	cookieAccessName: string,
): string | undefined {
	const authz = req.headers.authorization;
	if (typeof authz === 'string' && authz.startsWith('Bearer ')) {
		const t = authz.slice(7).trim();
		if (t.length > 0) {
			return t;
		}
	}
	// Nome do cookie vem de AUTH_CONFIG (servidor), não de input do cliente.
	// eslint-disable-next-line security/detect-object-injection -- chave fixa por deploy
	const c = req.cookies?.[cookieAccessName];
	if (typeof c === 'string') {
		const t = c.trim();
		if (t.length > 0) {
			return t;
		}
	}
	return undefined;
}

/** Auth global via `AuthTokenService` (evita bug de resolução da Promise com Passport 0.7 + callback customizado no Nest). */
@Injectable()
class GlobalAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly tokens: AuthTokenService,
		private readonly sessions: AuthSessionRedisService,
		@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Request>();
		const path = httpPath(req);

		if (isOpenDocumentationPath(path)) {
			return true;
		}

		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}

		const token = extractAccessToken(req, this.authConfig.cookieAccessName);
		if (typeof token !== 'string') {
			throw new UnauthorizedException();
		}

		let payload: Awaited<ReturnType<AuthTokenService['verifyAccessToken']>>;
		try {
			payload = await this.tokens.verifyAccessToken(token);
		} catch {
			throw new UnauthorizedException();
		}

		if (
			payload.typ !== 'access' ||
			typeof payload.sub !== 'string' ||
			payload.sub.length === 0 ||
			typeof payload.jti !== 'string' ||
			payload.jti.length === 0 ||
			typeof payload.role !== 'string' ||
			payload.role.length === 0
		) {
			throw new UnauthorizedException();
		}

		if (await this.sessions.isJtiBlacklisted(payload.jti)) {
			throw new UnauthorizedException('Token revogado.');
		}

		const user: JwtUser = {
			userId: payload.sub,
			role: payload.role,
			jti: payload.jti,
		};

		const required = this.reflector.getAllAndOverride<readonly UserRole[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (required !== undefined && required.length > 0) {
			if (!required.includes(user.role as UserRole)) {
				throw new ForbiddenException(
					'Permissão insuficiente para este recurso.',
				);
			}
		}

		Object.assign(req, { user });
		return true;
	}
}

export { GlobalAuthGuard };
