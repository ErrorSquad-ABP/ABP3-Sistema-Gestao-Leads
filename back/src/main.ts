import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { env } from './shared/config/env.js';
import { buildSwaggerConfig } from './shared/config/swagger.js';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors();
	app.setGlobalPrefix('api');

	const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
	SwaggerModule.setup('docs', app, document);

	await app.listen(env.port);
}

void bootstrap();
