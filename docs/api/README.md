# API REST

## Estado atual (contrato vigente)

A API é a aplicação **NestJS** em `back/`, com prefixo global **`/api`**.

- **OpenAPI**: `GET /api/docs-json`; Swagger UI em `/api/docs`; Scalar em `/api/scalar`.
- **Respostas JSON com corpo**: envelope `{ success, message, data, errors }` (interceptor global + filtro de erros).
- **Autenticação**: access JWT (cookie HttpOnly e/ou `Authorization: Bearer`); refresh opaco em cookie; ver `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`.
- **Persistência**: **Prisma** + PostgreSQL; senhas com **Argon2**.
- **Autorização**: guard de autenticação **global** (`GlobalAuthGuard`) + decorador `@Roles()` com papéis canónicos (`ATTENDANT`, `MANAGER`, `GENERAL_MANAGER`, `ADMINISTRATOR`).
- **Nota sobre `v1`**: existe `GET /api/v1` (resumo do sistema). Os recursos REST (`/api/users`, `/api/leads`, …) **não** usam o prefixo `/api/v1/` no path.

Documentação histórica que usava `/api/v1` em todos os recursos, `PUT /auth/credentials`, papéis `ADMIN` / `MANAGER_GERAL` ou respostas sem envelope foi **substituída** pelos ficheiros abaixo, alinhados ao repositório.

## Recursos previstos (produto)

- `/auth`, `/users`, `/teams`, `/stores`, `/customers`, `/leads`, `/negotiations`, `/dashboards`, `/audit-logs`

Nem todos têm controllers HTTP nesta fase; ver [endpoints-sprint-1.md](./endpoints-sprint-1.md).

## Regras operacionais

- JWT (access) para rotas protegidas; rotas marcadas com `@Public()` não exigem token.
- RBAC no backend; validação de papel via `@Roles()` quando aplicável.
- Comunicação com o frontend por `HTTP/JSON`; CORS com `credentials` quando há cookies.

## Documentação de endpoints

### Começar por aqui

**[SPRINT-1-ENDPOINTS-SUMMARY.md](./SPRINT-1-ENDPOINTS-SUMMARY.md)** — Índice rápido e links.

### Sprint 1 — Detalhe

- **[Contratos mínimos (vigentes)](./endpoints-sprint-1.md)** — Rotas e contratos alinhados ao código em `back/`.
- **[Rastreabilidade](./traceability-endpoints-to-requirements.md)** — US-01 a US-07, RF/RNF (com nota onde a API ainda não cobre o requisito).
- **[Guia de implementação](./implementation-guide-sprint-1.md)** — Padrão do repositório: módulos em `modules/*`, use cases, Prisma, guard global.

Baseado em: `US-01` … `US-07`.

## Próximos passos

1. Manter `endpoints-sprint-1.md` e OpenAPI sincronizados após mudanças em controllers.
2. Implementar rotas em falta (US-02 dedicada, US-05, US-06) seguindo as convenções deste README.
3. Validar integração com o frontend contra `/api/docs-json` e testes.
