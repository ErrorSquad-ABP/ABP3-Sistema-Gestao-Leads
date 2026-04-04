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
import {
	extractAccessTokenFromRequest,
	extractRefreshTokenFromRequest,
} from '../../../../shared/presentation/utils/request-auth.util.js';
import { UserResponseDto } from '../../../users/application/dto/user-response.dto.js';
import { UserNotFoundError } from '../../../users/domain/errors/user-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { FindUserUseCase } from '../../../users/application/use-cases/find-user.use-case.js';
import { UserPresenter } from '../../../users/presentation/presenters/user.presenter.js';
// biome-ignore lint/style/useImportType: Nest DI
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { LogoutUseCase } from '../../application/use-cases/logout.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { RefreshTokensUseCase } from '../../application/use-cases/refresh-tokens.use-case.js';
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

/** IP do cliente via Express (`trust proxy` em `main.ts` + `TRUST_PROXY`); não ler `X-Forwarded-For` manualmente. */
function clientIp(req: Request): string {
	return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

function wantsRefreshTokenInBody(req: Request): boolean {
	const raw = req.headers['x-expose-refresh-token'];
	const v =
		typeof raw === 'string'
			? raw.trim().toLowerCase()
			: Array.isArray(raw)
				? (raw[0]?.trim().toLowerCase() ?? '')
				: '';
	return v === 'true' || v === '1' || v === 'yes';
}

function buildLoginResponse(
	user: ReturnType<typeof UserPresenter.toResponse>,
	accessToken: string,
	refreshToken: string,
	req: Request,
): LoginResponseDto {
	if (wantsRefreshTokenInBody(req)) {
		return { user, accessToken, refreshToken };
	}
	return { user, accessToken };
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
		private readonly refreshTokensUseCase: RefreshTokensUseCase,
		private readonly logoutUseCase: LogoutUseCase,
		private readonly findUser: FindUserUseCase,
	) {}

	private cookieBase() {
		return {
			httpOnly: true,
			secure: env.nodeEnv === 'production',
			sameSite: this.authConfig.cookieSameSite,
			path: '/',
		};
	}

	private setAuthCookies(
		res: Response,
		accessToken: string,
		refreshToken: string,
	): void {
		res.cookie(this.authConfig.cookieAccessName, accessToken, {
			...this.cookieBase(),
			maxAge: this.authConfig.accessTtlSeconds * 1000,
		});
		res.cookie(this.authConfig.cookieRefreshName, refreshToken, {
			...this.cookieBase(),
			maxAge: this.authConfig.refreshTtlSeconds * 1000,
		});
	}

	@Public()
	@Post('auth/login')
	@ApiOperation({
		summary: 'Login',
		description:
			'Define cookies HttpOnly. O JSON inclui sempre `accessToken` (clientes sem cookie) e `user`. O refresh **não** vai no corpo por padrão (só cookie); para mobile/API que precise do refresh no JSON, envie `X-Expose-Refresh-Token: true`. Rate limit por IP+e-mail (Redis); com `TRUST_PROXY` atrás de proxy confiável o IP vem de `req.ip`.',
	})
	@ApiOkResponseEnvelope(LoginResponseDto, {
		description: 'Usuário + tokens (e cookies paralelos).',
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
		await this.authRateLimiter.consumeLoginAttempt(
			rateLimitBucketHash([clientIp(req), body.email.toLowerCase()]),
		);
		const result = await this.loginUseCase.execute(body.email, body.password);
		this.setAuthCookies(res, result.accessToken, result.refreshToken);
		return buildLoginResponse(
			UserPresenter.toResponse(result.user),
			result.accessToken,
			result.refreshToken,
			req,
		);
	}

	@Public()
	@Post('auth/refresh')
	@ApiOperation({
		summary: 'Renovar tokens',
		description:
			'Refresh: cookie HttpOnly, header `X-Refresh-Token` ou `Authorization: Bearer <refresh>`. Resposta: cookies + JSON com `accessToken` e `user`; `refreshToken` no corpo só com `X-Expose-Refresh-Token: true`. Limite por IP (Redis).',
	})
	@ApiOkResponseEnvelope(LoginResponseDto)
	@ApiUnauthorizedResponse({
		description: 'Refresh inválido ou já rotacionado',
	})
	@ApiTooManyRequestsResponse({
		description: 'Excesso de tentativas de refresh no intervalo configurado.',
	})
	async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<LoginResponseDto> {
		await this.authRateLimiter.consumeRefreshAttempt(
			rateLimitBucketHash([clientIp(req)]),
		);
		const refreshToken = extractRefreshTokenFromRequest(
			req,
			this.authConfig.cookieRefreshName,
		);
		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token ausente.');
		}
		const result = await this.refreshTokensUseCase.execute(refreshToken);
		this.setAuthCookies(res, result.accessToken, result.refreshToken);
		return buildLoginResponse(
			UserPresenter.toResponse(result.user),
			result.accessToken,
			result.refreshToken,
			req,
		);
	}

	@Public()
	@Post('auth/logout')
	@HttpCode(204)
	@ApiOperation({
		summary: 'Logout',
		description:
			'Revoga tokens na blacklist quando possível. Access: Bearer, cookie ou corpo `accessToken`. Refresh: mesmo contrato que `POST /auth/refresh` (cookie, `X-Refresh-Token`, Bearer) ou corpo `refreshToken`.',
	})
	@ApiNoContentResponse()
	async logout(
		@Req() req: Request,
		@Body() body: LogoutValidator,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		const access =
			extractAccessTokenFromRequest(req, this.authConfig.cookieAccessName) ??
			body.accessToken;
		const refresh = extractRefreshTokenFromRequest(
			req,
			this.authConfig.cookieRefreshName,
			body.refreshToken,
		);
		await this.logoutUseCase.execute(access, refresh);
		const base = this.cookieBase();
		res.clearCookie(this.authConfig.cookieAccessName, base);
		res.clearCookie(this.authConfig.cookieRefreshName, base);
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
