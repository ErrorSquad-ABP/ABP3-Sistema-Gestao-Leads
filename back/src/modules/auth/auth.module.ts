import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import type { AuthConfig } from '../../config/auth.config.js';
import { AUTH_CONFIG } from '../../config/auth-injection.token.js';
import { UsersModule } from '../users/users.module.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { LogoutUseCase } from './application/use-cases/logout.use-case.js';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case.js';
import { AuthRateLimiterService } from './infrastructure/auth-rate-limiter.service.js';
import { AuthSessionRedisService } from './infrastructure/auth-session-redis.service.js';
import { AuthTokenService } from './infrastructure/auth-token.service.js';
import { AuthController } from './presentation/controllers/auth.controller.js';

@Module({
	imports: [
		UsersModule,
		JwtModule.registerAsync({
			useFactory: (cfg: AuthConfig) => ({
				privateKey: cfg.accessPrivateKey,
				publicKey: cfg.accessPublicKey,
				signOptions: {
					algorithm: 'RS256' as const,
					issuer: cfg.issuer,
					...(cfg.audience !== undefined ? { audience: cfg.audience } : {}),
				},
				verifyOptions: {
					algorithms: ['RS256' as const],
					issuer: cfg.issuer,
					...(cfg.audience !== undefined ? { audience: cfg.audience } : {}),
				},
			}),
			inject: [AUTH_CONFIG],
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthRateLimiterService,
		AuthTokenService,
		AuthSessionRedisService,
		LoginUseCase,
		RefreshTokensUseCase,
		LogoutUseCase,
	],
	exports: [AuthTokenService, AuthSessionRedisService],
})
class AuthModule {}

export { AuthModule };
