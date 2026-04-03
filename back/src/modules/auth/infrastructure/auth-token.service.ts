import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { JwtService } from '@nestjs/jwt';

import type { AuthConfig } from '../../../config/auth.config.js';
import { AUTH_CONFIG } from '../../../config/auth-injection.token.js';
import type { User } from '../../users/domain/entities/user.entity.js';

type AccessPayload = {
	readonly sub: string;
	readonly role: string;
	readonly jti: string;
	readonly typ: 'access';
	readonly exp?: number;
};

type RefreshPayload = {
	readonly sub: string;
	readonly jti: string;
	readonly fam: string;
	readonly typ: 'refresh';
	readonly exp?: number;
};

@Injectable()
class AuthTokenService {
	constructor(
		private readonly jwt: JwtService,
		@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig,
	) {}

	private jwtIssuerAudience(): {
		readonly issuer: string;
		readonly audience?: string;
	} {
		return {
			issuer: this.authConfig.issuer,
			...(this.authConfig.audience !== undefined
				? { audience: this.authConfig.audience }
				: {}),
		};
	}

	async signAccessToken(user: User): Promise<{ token: string; jti: string }> {
		const jti = randomUUID();
		const payload: AccessPayload = {
			sub: user.id.value,
			role: user.role,
			jti,
			typ: 'access',
		};
		const token = await this.jwt.signAsync(payload, {
			algorithm: 'RS256',
			privateKey: this.authConfig.accessPrivateKey,
			expiresIn: this.authConfig.accessTtlSeconds,
			...this.jwtIssuerAudience(),
		});
		return { token, jti };
	}

	async signRefreshToken(
		userId: string,
		familyId: string,
	): Promise<{ token: string; jti: string }> {
		const jti = randomUUID();
		const payload: RefreshPayload = {
			sub: userId,
			jti,
			fam: familyId,
			typ: 'refresh',
		};
		const token = await this.jwt.signAsync(payload, {
			algorithm: 'RS256',
			privateKey: this.authConfig.refreshPrivateKey,
			expiresIn: this.authConfig.refreshTtlSeconds,
			...this.jwtIssuerAudience(),
		});
		return { token, jti };
	}

	async verifyAccessToken(
		token: string,
	): Promise<AccessPayload & { readonly exp?: number }> {
		return this.jwt.verifyAsync<AccessPayload & { readonly exp?: number }>(
			token,
			{
				algorithms: ['RS256'],
				publicKey: this.authConfig.accessPublicKey,
				...this.jwtIssuerAudience(),
			},
		);
	}

	async verifyRefreshToken(
		token: string,
	): Promise<RefreshPayload & { readonly exp?: number }> {
		return this.jwt.verifyAsync<RefreshPayload & { readonly exp?: number }>(
			token,
			{
				algorithms: ['RS256'],
				publicKey: this.authConfig.refreshPublicKey,
				...this.jwtIssuerAudience(),
			},
		);
	}

	decodeUnsafe(
		token: string,
	): ((AccessPayload | RefreshPayload) & { readonly exp?: number }) | null {
		const decoded = this.jwt.decode(token, { json: true });
		if (!decoded || typeof decoded !== 'object') {
			return null;
		}
		const o = decoded as Record<string, unknown>;
		if (typeof o.sub !== 'string' || typeof o.jti !== 'string') {
			return null;
		}
		const exp = typeof o.exp === 'number' ? o.exp : undefined;
		if (o.typ === 'access' && typeof o.role === 'string') {
			return {
				sub: o.sub,
				role: o.role,
				jti: o.jti,
				typ: 'access',
				exp,
			};
		}
		if (o.typ === 'refresh' && typeof o.fam === 'string') {
			return {
				sub: o.sub,
				jti: o.jti,
				fam: o.fam,
				typ: 'refresh',
				exp,
			};
		}
		return null;
	}
}

export type { AccessPayload, RefreshPayload };
export { AuthTokenService };
