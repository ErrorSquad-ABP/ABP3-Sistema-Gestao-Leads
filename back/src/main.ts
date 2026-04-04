import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Express } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import type { AuthConfig } from './config/auth.config.js';
import { AUTH_CONFIG } from './config/auth-injection.token.js';
import { env } from './config/env.js';
import { buildSwaggerConfig } from './config/swagger.js';
import { DomainErrorFilter } from './shared/presentation/filters/domain-error.filter.js';
import { ApiResponseInterceptor } from './shared/presentation/interceptors/api-response.interceptor.js';

const JSON_BODY_LIMIT = '512kb';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useBodyParser('json', { limit: JSON_BODY_LIMIT });
	app.useBodyParser('urlencoded', { extended: true, limit: JSON_BODY_LIMIT });

	const http = app.getHttpAdapter();
	if (http.getType() === 'express') {
		const expressApp = http.getInstance() as Express;
		expressApp.set('trust proxy', env.trustProxy);
		expressApp.use(
			helmet({
				contentSecurityPolicy: false,
				crossOriginEmbedderPolicy: false,
				...(env.nodeEnv === 'production' ? {} : { hsts: false }),
			}),
		);
	}

	const reflector = app.get(Reflector);
	app.useGlobalInterceptors(new ApiResponseInterceptor(reflector));

	/** Erros → envelope JSON; domínio (`*Error`) com status adequado. */
	app.useGlobalFilters(new DomainErrorFilter());

	const authCfg = app.get<AuthConfig>(AUTH_CONFIG);
	app.use(cookieParser());
	app.enableCors({
		origin: (origin, callback) => {
			if (!origin) {
				callback(null, true);
				return;
			}
			callback(null, authCfg.frontendOrigins.includes(origin));
		},
		credentials: true,
	});
	app.enableShutdownHooks();
	app.setGlobalPrefix('api');
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		}),
	);

	const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
	SwaggerModule.setup('docs', app, document, {
		useGlobalPrefix: true,
	});

	app.use(
		'/api/scalar',
		apiReference({
			url: '/api/docs-json',
			pageTitle: 'Sistema de Gestão de Leads API',
		}),
	);

	await app.listen(env.port);
}

void bootstrap();
