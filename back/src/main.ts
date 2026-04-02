import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { env } from './config/env.js';
import { buildSwaggerConfig } from './config/swagger.js';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

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
	SwaggerModule.setup('docs', app, document);

	await app.listen(env.port);
}

void bootstrap();
