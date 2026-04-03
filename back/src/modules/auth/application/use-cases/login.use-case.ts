import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { Argon2PasswordHasherService } from '../../../../shared/infrastructure/security/argon2-password-hasher.service.js';
import type { User } from '../../../users/domain/entities/user.entity.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { AuthSessionRedisService } from '../../infrastructure/auth-session-redis.service.js';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { AuthTokenService } from '../../infrastructure/auth-token.service.js';

/** Hash Argon2id fixo (senha desconhecida) para equalizar tempo quando o e-mail não existe. */
const DUMMY_ARGON2_TIMING_PAD =
	'$argon2id$v=19$m=19456,t=2,p=1$H5K4T/9lCdJ1rPy/qic1Iw$FxSLF4hsA96bMKbhvKfu/V2rNzhVOH9YGJdkYyqbyXA';

@Injectable()
class LoginUseCase {
	constructor(
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly passwordHasher: Argon2PasswordHasherService,
		private readonly tokens: AuthTokenService,
		private readonly sessions: AuthSessionRedisService,
	) {}

	async execute(
		email: string,
		password: string,
	): Promise<{
		readonly user: User;
		readonly accessToken: string;
		readonly refreshToken: string;
	}> {
		const users = this.userRepositoryFactory.create();
		const user = await users.findByEmail(email);
		if (!user) {
			await this.passwordHasher.verify(password, DUMMY_ARGON2_TIMING_PAD);
			throw new InvalidCredentialsError();
		}
		const ok = await this.passwordHasher.verify(
			password,
			user.passwordHash.value,
		);
		if (!ok) {
			throw new InvalidCredentialsError();
		}

		const familyId = randomUUID();
		const access = await this.tokens.signAccessToken(user);
		const refresh = await this.tokens.signRefreshToken(user.id.value, familyId);
		await this.sessions.setCurrentRefreshJti(familyId, refresh.jti);

		return {
			user,
			accessToken: access.token,
			refreshToken: refresh.token,
		};
	}
}

export { LoginUseCase };
