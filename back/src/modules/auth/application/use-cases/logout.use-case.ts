import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: Nest DI
import { AuthSessionPrismaRepository } from '../../infrastructure/auth-session.prisma-repository.js';

@Injectable()
class LogoutUseCase {
	constructor(private readonly authSessions: AuthSessionPrismaRepository) {}

	async execute(rawRefreshToken: string | undefined): Promise<void> {
		if (typeof rawRefreshToken === 'string' && rawRefreshToken.trim() !== '') {
			await this.authSessions.revokeByRefreshToken(rawRefreshToken);
		}
	}
}

export { LogoutUseCase };
