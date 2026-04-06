import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type { User } from '../../../users/domain/entities/user.entity.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { RefreshTokenInvalidError } from '../../domain/errors/refresh-token-invalid.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AuthSessionPrismaRepository } from '../../infrastructure/auth-session.prisma-repository.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AuthTokenService } from '../../infrastructure/auth-token.service.js';

@Injectable()
class RefreshTokensUseCase {
	constructor(
		private readonly authSessions: AuthSessionPrismaRepository,
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly tokens: AuthTokenService,
	) {}

	async execute(
		rawRefreshToken: string,
		meta: { readonly userAgent?: string; readonly ipAddress?: string },
	): Promise<{
		readonly user: User;
		readonly accessToken: string;
		readonly refreshToken: string;
	}> {
		const users = this.userRepositoryFactory.create();
		const userId = await this.authSessions.getUserIdByValidRefreshToken(
			rawRefreshToken,
		);
		const user = await users.findById(Uuid.parse(userId));
		if (user === null) {
			throw new RefreshTokenInvalidError();
		}
		const access = await this.tokens.signAccessToken(user);
		const rotated = await this.authSessions.rotateRefreshToken(rawRefreshToken, meta);
		return {
			user,
			accessToken: access.token,
			refreshToken: rotated.refreshToken,
		};
	}
}

export { RefreshTokensUseCase };
