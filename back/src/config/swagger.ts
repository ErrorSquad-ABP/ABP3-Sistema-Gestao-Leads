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
				'Auth: JWT RS256 (access e, opcionalmente, refresh com par de chaves dedicado; `JWT_AUDIENCE` opcional). Login/refresh com rate limit (Redis). `POST /auth/login` e `POST /auth/refresh` devolvem tokens no JSON e em cookies HttpOnly; refresh aceita também `X-Refresh-Token`. Rotas protegidas: `Authorization: Bearer <access>` ou cookie de access. CORS com `credentials` exige origem em `FRONTEND_ORIGINS`. CRUD de usuários exige role `ADMINISTRATOR`.',
			].join(' '),
		)
		.setVersion('0.1.0')
		.addBearerAuth()
		.build();
}

export { buildSwaggerConfig };
