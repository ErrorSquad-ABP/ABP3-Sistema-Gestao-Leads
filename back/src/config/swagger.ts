import { DocumentBuilder } from '@nestjs/swagger';

function buildSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle('Sistema de Gestão de Leads API')
		.setDescription(
			[
				'API modular em NestJS para o Sistema de Gestão de Leads com Dashboard Analítico.',
				'Todas as rotas HTTP estão sob o prefixo global `/api`.',
				'Documentação interativa: Swagger UI em `/api/docs`; Scalar em `/api/scalar` (mesmo OpenAPI em `/api/docs-json`).',
				'Respostas JSON seguem o envelope: `{ success, message, data, errors }` (sucesso: `success: true`, `data` com o payload; erros: `success: false`, `errors` como lista).',
				'Os schemas `200`/`201` com corpo documentam esse envelope; o DTO do caso de uso aparece em `data`.',
				'Respostas `204 No Content` não incluem corpo.',
			].join(' '),
		)
		.setVersion('0.1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description:
					'JWT de sessão. `users` e `stores`: papel ADMINISTRATOR. `teams`: MANAGER, GENERAL_MANAGER ou ADMINISTRATOR (estrutura comercial), quando guards JWT estiverem ativos.',
			},
			'access-token',
		)
		.build();
}

export { buildSwaggerConfig };
