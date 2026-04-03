import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI
import { FindUserUseCase } from '../../../users/application/use-cases/find-user.use-case.js';
import type { User } from '../../../users/domain/entities/user.entity.js';
import { RefreshTokenInvalidError } from '../../domain/errors/refresh-token-invalid.error.js';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { AuthSessionRedisService } from '../../infrastructure/auth-session-redis.service.js';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { AuthTokenService } from '../../infrastructure/auth-token.service.js';

@Injectable()
class RefreshTokensUseCase {
	constructor(
		private readonly tokens: AuthTokenService,
		private readonly sessions: AuthSessionRedisService,
		private readonly findUser: FindUserUseCase,
	) {}

	async execute(refreshToken: string): Promise<{
		readonly user: User;
		readonly accessToken: string;
		readonly refreshToken: string;
	}> {
		let payload: {
			readonly sub: string;
			readonly jti: string;
			readonly fam: string;
			readonly typ?: string;
		};
		try {
			const p = await this.tokens.verifyRefreshToken(refreshToken);
			payload = p;
		} catch {
			throw new RefreshTokenInvalidError();
		}

		if (payload.typ !== 'refresh') {
			throw new RefreshTokenInvalidError();
		}

		const user = await this.findUser.execute(payload.sub);
		const access = await this.tokens.signAccessToken(user);
		const refresh = await this.tokens.signRefreshToken(
			user.id.value,
			payload.fam,
		);

		const rotation = await this.sessions.tryRotateRefreshJti(
			payload.fam,
			payload.jti,
			refresh.jti,
		);
		if (rotation === 'missing') {
			throw new RefreshTokenInvalidError();
		}
		if (rotation === 'mismatch') {
			throw new RefreshTokenInvalidError(
				'Refresh token inválido ou já foi substituído (use o último refresh emitido).',
			);
		}

		return {
			user,
			accessToken: access.token,
			refreshToken: refresh.token,
		};
	}
}

export { RefreshTokensUseCase };
