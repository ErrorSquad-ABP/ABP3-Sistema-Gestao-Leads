import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { env } from '../../config/env.js';
import { parseCanonicalUserRole } from '../../shared/domain/enums/user-role.enum.js';
import type { UserRole } from '../../shared/domain/enums/user-role.enum.js';

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
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: env.jwtSecret || 'local-dev-only-jwt-secret-change-in-env',
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
