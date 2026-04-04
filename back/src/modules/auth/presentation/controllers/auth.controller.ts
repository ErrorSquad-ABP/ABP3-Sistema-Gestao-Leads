import { createHash } from 'node:crypto';
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Inject,
	Post,
	Req,
	Res,
	UnauthorizedException,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiNoContentResponse,
	ApiOperation,
	ApiTags,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import type { AuthConfig } from '../../../../config/auth.config.js';
import { AUTH_CONFIG } from '../../../../config/auth-injection.token.js';
import { env } from '../../../../config/env.js';
import { Public } from '../../../../shared/presentation/decorators/public.decorator.js';
import { ApiOkResponseEnvelope } from '../../../../shared/presentation/swagger/api-success-response.js';
import { UserResponseDto } from '../../../users/application/dto/user-response.dto.js';
import { UserNotFoundError } from '../../../users/domain/errors/user-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { FindUserUseCase } from '../../../users/application/use-cases/find-user.use-case.js';
import { UserPresenter } from '../../../users/presentation/presenters/user.presenter.js';
// biome-ignore lint/style/useImportType: Nest DI
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AuthRateLimiterService } from '../../infrastructure/auth-rate-limiter.service.js';
import {
	CurrentUser,
	type JwtUser,
} from '../decorators/current-user.decorator.js';
import { LoginResponseDto } from '../dto/login-response.dto.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { LoginValidator } from '../validators/login.validator.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { LogoutValidator } from '../validators/logout.validator.js';

/** IP do cliente via Express (`trust proxy` em `main.ts` + `TRUST_PROXY`). */
function clientIp(req: Request): string {
	return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

function rateLimitBucketHash(parts: readonly string[]): string {
	return createHash('sha256').update(parts.join('|')).digest('hex');
}

@ApiTags('auth')
@Controller()
class AuthController {
	constructor(
		@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig,
		private readonly authRateLimiter: AuthRateLimiterService,
		private readonly loginUseCase: LoginUseCase,
		private readonly findUser: FindUserUseCase,
	) {}

	/** Opções explícitas (evita falsos positivos de SAST em `res.cookie` / `clearCookie`). */
	private accessCookieOptions(maxAgeMs?: number) {
		const base = {
			httpOnly: true,
			secure: env.nodeEnv === 'production',
			sameSite: this.authConfig.cookieSameSite,
			path: '/',
		} as const;
		return maxAgeMs === undefined ? base : { ...base, maxAge: maxAgeMs };
	}

	@Public()
	@Post('auth/login')
	@ApiOperation({
		summary: 'Login',
		description:
			'Emite access JWT stateless (cookie HttpOnly + JSON). Sem refresh: novo login após expiração. Rate limit em memória por IP+e-mail; com `TRUST_PROXY` o IP vem de `req.ip`.',
	})
	@ApiOkResponseEnvelope(LoginResponseDto, {
		description: 'Utilizador + access token (e cookie).',
	})
	@ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
	@ApiTooManyRequestsResponse({
		description: 'Excesso de tentativas de login no intervalo configurado.',
	})
	async login(
		@Req() req: Request,
		@Body() body: LoginValidator,
		@Res({ passthrough: true }) res: Response,
	): Promise<LoginResponseDto> {
		this.authRateLimiter.consumeLoginAttempt(
			rateLimitBucketHash([clientIp(req), body.email.toLowerCase()]),
		);
		const result = await this.loginUseCase.execute(body.email, body.password);
		res.cookie(
			this.authConfig.cookieAccessName,
			result.accessToken,
			this.accessCookieOptions(this.authConfig.accessTtlSeconds * 1000),
		);
		return {
			user: UserPresenter.toResponse(result.user),
			accessToken: result.accessToken,
		};
	}

	@Public()
	@Post('auth/logout')
	@HttpCode(204)
	@ApiOperation({
		summary: 'Logout',
		description:
			'Remove cookies de access. O JWT continua válido até expirar (stateless).',
	})
	@ApiNoContentResponse()
	async logout(
		@Req() _req: Request,
		@Body() _body: LogoutValidator,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		res.clearCookie(
			this.authConfig.cookieAccessName,
			this.accessCookieOptions(),
		);
	}

	@Get('auth/me')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Usuário atual (JWT em cookie ou Authorization)' })
	@ApiOkResponseEnvelope(UserResponseDto)
	@ApiUnauthorizedResponse()
	async me(@CurrentUser() user: JwtUser): Promise<UserResponseDto> {
		try {
			const u = await this.findUser.execute(user.userId);
			return UserPresenter.toResponse(u);
		} catch (e) {
			if (e instanceof UserNotFoundError) {
				throw new UnauthorizedException(
					'Sessão inválida ou utilizador já não existe.',
				);
			}
			throw e;
		}
	}
}

export { AuthController };
