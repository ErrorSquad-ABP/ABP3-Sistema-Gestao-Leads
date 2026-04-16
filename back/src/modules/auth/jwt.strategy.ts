import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { Request } from 'express';

import type { AuthConfig } from '../../config/auth.config.js';
import { AUTH_CONFIG } from '../../config/auth-injection.token.js';
import { parseCanonicalUserRole } from '../../shared/domain/enums/user-role.enum.js';
import type { UserRole } from '../../shared/domain/enums/user-role.enum.js';
import { extractAccessTokenFromRequest } from '../../shared/presentation/utils/request-auth.util.js';

function normalizeJwtRole(raw: string): UserRole {
	try {
		const normalized = raw === 'ADMIN' ? 'ADMINISTRATOR' : raw;
		return parseCanonicalUserRole(normalized);
	} catch {
		throw new UnauthorizedException('Token invalido: papel desconhecido.');
	}
}

@Injectable()
class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(@Inject(AUTH_CONFIG) authConfig: AuthConfig) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) =>
					extractAccessTokenFromRequest(req, authConfig.cookieAccessName) ??
					null,
			]),
			ignoreExpiration: false,
			algorithms: ['RS256'],
			secretOrKey: authConfig.accessPublicKey,
			issuer: authConfig.issuer,
			...(authConfig.audience !== undefined
				? { audience: authConfig.audience }
				: {}),
		});
	}

	validate(payload: { sub?: unknown; role?: unknown }): {
		sub: string;
		role: UserRole;
	} {
		if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
			throw new UnauthorizedException();
		}
		return {
			sub: payload.sub,
			role: normalizeJwtRole(payload.role),
		};
	}
}

export { JwtStrategy };
