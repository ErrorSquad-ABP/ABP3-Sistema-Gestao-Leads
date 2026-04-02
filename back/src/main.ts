import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from './app.module.js';
import { env } from './config/env.js';
import { buildSwaggerConfig } from './config/swagger.js';
import { DomainErrorFilter } from './shared/presentation/filters/domain-error.filter.js';
import { ApiResponseInterceptor } from './shared/presentation/interceptors/api-response.interceptor.js';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const reflector = app.get(Reflector);
	app.useGlobalInterceptors(new ApiResponseInterceptor(reflector));

	/** Erros → envelope JSON; domínio (`*Error`) com status adequado. */
	app.useGlobalFilters(new DomainErrorFilter());

	app.enableCors();
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
