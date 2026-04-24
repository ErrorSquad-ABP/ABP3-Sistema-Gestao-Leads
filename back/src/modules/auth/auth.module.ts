import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module.js';
import { AuthRateLimiterService } from './infrastructure/auth-rate-limiter.service.js';
import { AuthSessionPrismaRepository } from './infrastructure/auth-session.prisma-repository.js';
import { AuthTokenService } from './infrastructure/auth-token.service.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { LogoutUseCase } from './application/use-cases/logout.use-case.js';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case.js';
import { UpdateOwnEmailUseCase } from './application/use-cases/update-own-email.use-case.js';
import { UpdateOwnPasswordUseCase } from './application/use-cases/update-own-password.use-case.js';
import { JwtStrategy } from './jwt.strategy.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { RolesGuard } from './roles.guard.js';

@Module({
	imports: [
		UsersModule,
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			signOptions: { expiresIn: '7d' },
		}),
	],
	controllers: [AuthController],
	providers: [
		JwtStrategy,
		JwtAuthGuard,
		RolesGuard,
		AuthTokenService,
		AuthRateLimiterService,
		AuthSessionPrismaRepository,
		LoginUseCase,
		RefreshTokensUseCase,
		LogoutUseCase,
		UpdateOwnEmailUseCase,
		UpdateOwnPasswordUseCase,
	],
	exports: [JwtModule, JwtAuthGuard, RolesGuard, AuthTokenService],
})
class AuthModule {}

export { AuthModule };
