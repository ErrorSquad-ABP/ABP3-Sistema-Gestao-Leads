import { createHash } from 'node:crypto';
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Inject,
	Patch,
	Post,
	Req,
	Res,
	UnauthorizedException,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
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
import { extractRefreshTokenFromRequest } from '../../../../shared/presentation/utils/request-auth.util.js';
import { UserResponseDto } from '../../../users/application/dto/user-response.dto.js';
// biome-ignore lint/style/useImportType: Nest DI
import { FindUserUseCase } from '../../../users/application/use-cases/find-user.use-case.js';
import { UserNotFoundError } from '../../../users/domain/errors/user-not-found.error.js';
import { UserPresenter } from '../../../users/presentation/presenters/user.presenter.js';
// biome-ignore lint/style/useImportType: Nest DI
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { LogoutUseCase } from '../../application/use-cases/logout.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { RefreshTokensUseCase } from '../../application/use-cases/refresh-tokens.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UpdateOwnEmailUseCase } from '../../application/use-cases/update-own-email.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UpdateOwnPasswordUseCase } from '../../application/use-cases/update-own-password.use-case.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AuthRateLimiterService } from '../../infrastructure/auth-rate-limiter.service.js';
import {
	CurrentUser,
	type JwtUser,
} from '../decorators/current-user.decorator.js';
import { LoginResponseDto } from '../dto/login-response.dto.js';
import { RefreshResponseDto } from '../dto/refresh-response.dto.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { LoginValidator } from '../validators/login.validator.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { LogoutValidator } from '../validators/logout.validator.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { RefreshValidator } from '../validators/refresh.validator.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { UpdateOwnEmailValidator } from '../validators/update-own-email.validator.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { UpdateOwnPasswordValidator } from '../validators/update-own-password.validator.js';

/** IP do cliente via Express (`trust proxy` em `main.ts` + `TRUST_PROXY`). */
function clientIp(req: Request): string {
	return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

function rateLimitBucketHash(parts: readonly string[]): string {
	return createHash('sha256').update(parts.join('|')).digest('hex');
}

/** Prefixo do refresh (não o token completo) para granularidade além do IP no rate limit. */
function refreshRateLimitTokenPart(raw: string): string {
	const n = Math.min(80, raw.length);
	return createHash('sha256').update(raw.slice(0, n)).digest('hex');
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
		private readonly updateOwnEmailUseCase: UpdateOwnEmailUseCase,
		private readonly updateOwnPasswordUseCase: UpdateOwnPasswordUseCase,
	) {}

	/** HttpOnly cookies auth (access + refresh): mesmas flags de segurança. */
	private authHttpOnlyCookieOptions(maxAgeMs?: number) {
		const base = {
			httpOnly: true,
			secure: env.nodeEnv === 'production',
			sameSite: this.authConfig.cookieSameSite,
			path: '/',
		} as const;
		return maxAgeMs === undefined ? base : { ...base, maxAge: maxAgeMs };
	}

	private clientMeta(req: Request): {
		readonly userAgent: string | undefined;
		readonly ipAddress: string | undefined;
	} {
		const ua = req.headers['user-agent'];
		const ip = clientIp(req);
		return {
			userAgent: typeof ua === 'string' ? ua : undefined,
			ipAddress: ip === 'unknown' ? undefined : ip,
		};
	}

	@Public()
	@Post('auth/login')
	@ApiOperation({
		summary: 'Login',
		description:
			'Emite access JWT e refresh opaco (ambos em cookies HttpOnly + JSON com user e access). Rotação em `POST /auth/refresh`. Rate limit login (IP+e-mail). Opcional: `AUTH_MAX_ACTIVE_SESSIONS_PER_USER` revoga a sessão mais antiga ao exceder o limite.',
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
		const result = await this.loginUseCase.execute(
			body.email,
			body.password,
			this.clientMeta(req),
		);
		res.cookie(
			this.authConfig.cookieAccessName,
			result.accessToken,
			this.authHttpOnlyCookieOptions(this.authConfig.accessTtlSeconds * 1000),
		);
		res.cookie(
			this.authConfig.cookieRefreshName,
			result.refreshToken,
			this.authHttpOnlyCookieOptions(this.authConfig.refreshTtlSeconds * 1000),
		);
		return {
			user: UserPresenter.toResponse(result.user),
			accessToken: result.accessToken,
		};
	}

	@Public()
	@Post('auth/refresh')
	@ApiOperation({
		summary: 'Refresh',
		description:
			'Rotação atómica do refresh opaco (cookie ou corpo). Novo access e novo refresh em cookies HttpOnly. Rate limit por IP + identificador derivado do token.',
	})
	@ApiOkResponseEnvelope(RefreshResponseDto)
	@ApiUnauthorizedResponse({ description: 'Refresh ausente ou inválido' })
	@ApiTooManyRequestsResponse({
		description: 'Excesso de tentativas de refresh no intervalo configurado.',
	})
	async refresh(
		@Req() req: Request,
		@Body() _body: RefreshValidator,
		@Res({ passthrough: true }) res: Response,
	): Promise<RefreshResponseDto> {
		const raw = extractRefreshTokenFromRequest(
			req,
			this.authConfig.cookieRefreshName,
		);
		this.authRateLimiter.consumeRefreshAttempt(
			rateLimitBucketHash([
				clientIp(req),
				raw === undefined ? 'missing' : refreshRateLimitTokenPart(raw),
			]),
		);
		if (raw === undefined) {
			throw new UnauthorizedException();
		}
		const result = await this.refreshTokensUseCase.execute(
			raw,
			this.clientMeta(req),
		);
		res.cookie(
			this.authConfig.cookieAccessName,
			result.accessToken,
			this.authHttpOnlyCookieOptions(this.authConfig.accessTtlSeconds * 1000),
		);
		res.cookie(
			this.authConfig.cookieRefreshName,
			result.refreshToken,
			this.authHttpOnlyCookieOptions(this.authConfig.refreshTtlSeconds * 1000),
		);
		return { accessToken: result.accessToken };
	}

	@Public()
	@Post('auth/logout')
	@HttpCode(204)
	@ApiOperation({
		summary: 'Logout',
		description:
			'Revoga a sessão de refresh no Postgres (se o token for válido) e remove cookies de access e refresh. O access JWT continua válido até expirar.',
	})
	@ApiNoContentResponse()
	async logout(
		@Req() req: Request,
		@Body() _body: LogoutValidator,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		const refresh = extractRefreshTokenFromRequest(
			req,
			this.authConfig.cookieRefreshName,
		);
		await this.logoutUseCase.execute(refresh);
		const opts = this.authHttpOnlyCookieOptions();
		res.clearCookie(this.authConfig.cookieAccessName, opts);
		res.clearCookie(this.authConfig.cookieRefreshName, opts);
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

	@Patch('auth/me/email')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Atualizar o próprio e-mail',
		description:
			'Exige a senha atual. Se o e-mail mudar, todas as sessões de refresh deste utilizador são revogadas (é necessário voltar a autenticar-se). O access JWT em curso continua válido até expirar (claims não incluem e-mail).',
	})
	@ApiOkResponseEnvelope(UserResponseDto)
	@ApiUnauthorizedResponse({
		description: 'Senha atual incorreta ou utilizador já não existe.',
	})
	@ApiConflictResponse({ description: 'E-mail já usado por outro utilizador.' })
	@ApiBadRequestResponse({
		description: 'Corpo inválido (ValidationPipe).',
	})
	@ApiTooManyRequestsResponse({
		description:
			'Excesso de tentativas de alteração de credenciais no intervalo configurado.',
	})
	async updateOwnEmail(
		@Req() req: Request,
		@CurrentUser() jwtUser: JwtUser,
		@Body() body: UpdateOwnEmailValidator,
	): Promise<UserResponseDto> {
		this.authRateLimiter.consumeCredentialUpdateAttempt(
			rateLimitBucketHash([clientIp(req), jwtUser.userId]),
		);
		try {
			const u = await this.updateOwnEmailUseCase.execute(jwtUser.userId, {
				currentPassword: body.currentPassword,
				email: body.email,
			});
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

	@Patch('auth/me/password')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Atualizar a própria senha',
		description:
			'Exige a senha atual. Após sucesso, todas as sessões de refresh são revogadas; novo login necessário para obter refresh. Access JWT atual mantém-se até expirar.',
	})
	@ApiOkResponseEnvelope(UserResponseDto)
	@ApiUnauthorizedResponse({
		description: 'Senha atual incorreta ou utilizador já não existe.',
	})
	@ApiBadRequestResponse({
		description:
			'Validação do corpo ou nova senha igual à atual (`user.password.unchanged`).',
	})
	@ApiTooManyRequestsResponse({
		description:
			'Excesso de tentativas de alteração de credenciais no intervalo configurado.',
	})
	async updateOwnPassword(
		@Req() req: Request,
		@CurrentUser() jwtUser: JwtUser,
		@Body() body: UpdateOwnPasswordValidator,
	): Promise<UserResponseDto> {
		this.authRateLimiter.consumeCredentialUpdateAttempt(
			rateLimitBucketHash([clientIp(req), jwtUser.userId]),
		);
		try {
			const u = await this.updateOwnPasswordUseCase.execute(jwtUser.userId, {
				currentPassword: body.currentPassword,
				newPassword: body.newPassword,
			});
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
