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
				'Auth: access JWT RS256 **stateless**; refresh **opaco** (`<sessionId>.<secret>`) só em cookie HttpOnly e hash no Postgres (sem Redis). `JWT_AUDIENCE` obrigatório em `NODE_ENV=production`. `POST /auth/login` define cookies access+refresh; JSON com `user` e `accessToken`. `POST /auth/refresh` rota o refresh e renova cookies. `POST /auth/logout` revoga sessão no banco e limpa cookies; o access JWT segue válido até expirar. `PATCH /auth/me/email` e `/auth/me/password` revogam sessões de refresh quando aplicável, limpam o cookie de refresh na resposta nesses casos e devolvem `data.refreshSessionsRevoked` para o cliente alinhar o estado. Rate limit login (IP+e-mail) e refresh (IP + hash de prefixo do token) em **memória** por processo. O corpo JSON com `refreshToken` é **removido do `req.body`** cedo no pipeline (valor em `req.authRefreshTokenFromBody` internamente) para reduzir vazamento em logs. Com `AUTH_COOKIE_SAMESITE=none` (SPA cross-site) use **HTTPS**, `secure` cookies e considere **anti-CSRF** (ex. header/token duplo) em `POST /auth/refresh` e `logout`. Rotas protegidas: `Authorization: Bearer <access>` ou cookie de access. CORS com `credentials` exige origem em `FRONTEND_ORIGINS`. CRUD de usuários exige role `ADMINISTRATOR`.',
			].join(' '),
		)
		.setVersion('0.1.0')
		.addBearerAuth()
		.build();
}

export { buildSwaggerConfig };
