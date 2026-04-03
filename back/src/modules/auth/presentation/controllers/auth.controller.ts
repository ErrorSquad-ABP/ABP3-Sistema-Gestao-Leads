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

function bearerToken(req: Request): string | undefined {
	const h = req.headers.authorization;
	if (typeof h !== 'string' || !h.startsWith('Bearer ')) {
		return undefined;
	}
	const t = h.slice(7).trim();
	return t.length > 0 ? t : undefined;
}

function clientIp(req: Request): string {
	const xf = req.headers['x-forwarded-for'];
	const first =
		typeof xf === 'string'
			? xf.split(',')[0]?.trim()
			: Array.isArray(xf)
				? xf[0]?.trim()
				: undefined;
	return first ?? req.socket.remoteAddress ?? 'unknown';
}

function rateLimitBucketHash(parts: readonly string[]): string {
	return createHash('sha256').update(parts.join('|')).digest('hex');
}

function headerRefreshToken(req: Request): string | undefined {
	const raw = req.headers['x-refresh-token'];
	const v =
		typeof raw === 'string'
			? raw.trim()
			: Array.isArray(raw)
				? raw[0]?.trim()
				: undefined;
	return v !== undefined && v.length > 0 ? v : undefined;
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
			sameSite: 'lax' as const,
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
			'Define cookies HttpOnly e devolve tokens no JSON para clientes sem cookies (mobile/API). Authorization Bearer pode ser usado nas rotas protegidas com o access retornado. Limite de tentativas por IP+e-mail (Redis).',
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
		return {
			user: UserPresenter.toResponse(result.user),
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
		};
	}

	@Public()
	@Post('auth/refresh')
	@ApiOperation({
		summary: 'Renovar tokens',
		description:
			'Refresh: cookie HttpOnly, header `X-Refresh-Token` ou `Authorization: Bearer <refresh>`. Resposta: cookies + JSON com access/refresh. Limite por IP (Redis).',
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
		const fromCookie =
			req.cookies?.[this.authConfig.cookieRefreshName] ?? undefined;
		const fromX = headerRefreshToken(req);
		const fromBearer = bearerToken(req);
		const refreshToken = fromCookie ?? fromX ?? fromBearer;
		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token ausente.');
		}
		const result = await this.refreshTokensUseCase.execute(refreshToken);
		this.setAuthCookies(res, result.accessToken, result.refreshToken);
		return {
			user: UserPresenter.toResponse(result.user),
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
		};
	}

	@Public()
	@Post('auth/logout')
	@HttpCode(204)
	@ApiOperation({
		summary: 'Logout',
		description:
			'Revoga tokens na blacklist quando possível. Access: `Authorization: Bearer`, cookie ou corpo. Refresh: cookie ou corpo `refreshToken`.',
	})
	@ApiNoContentResponse()
	async logout(
		@Req() req: Request,
		@Body() body: LogoutValidator,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		const access =
			bearerToken(req) ??
			req.cookies?.[this.authConfig.cookieAccessName] ??
			body.accessToken;
		const refresh =
			req.cookies?.[this.authConfig.cookieRefreshName] ?? body.refreshToken;
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
		const u = await this.findUser.execute(user.userId);
		return UserPresenter.toResponse(u);
	}
}

export { AuthController };
