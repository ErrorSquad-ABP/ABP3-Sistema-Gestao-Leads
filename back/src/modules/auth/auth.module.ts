import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { env } from '../../config/env.js';
import { AuthTokenService } from './infrastructure/auth-token.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			secret: env.jwtSecret || 'local-dev-only-jwt-secret-change-in-env',
			signOptions: { expiresIn: '7d' },
		}),
	],
	providers: [JwtStrategy, JwtAuthGuard, RolesGuard, AuthTokenService],
	exports: [JwtModule, JwtAuthGuard, RolesGuard, AuthTokenService],
})
class AuthModule {}

export { AuthModule };
