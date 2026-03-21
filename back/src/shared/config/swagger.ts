import { DocumentBuilder } from '@nestjs/swagger';

function buildSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle('Sistema de Gestão de Leads API')
		.setDescription(
			'API modular em NestJS para o Sistema de Gestão de Leads com Dashboard Analítico.',
		)
		.setVersion('0.1.0')
		.addBearerAuth()
		.build();
}

export { buildSwaggerConfig };
