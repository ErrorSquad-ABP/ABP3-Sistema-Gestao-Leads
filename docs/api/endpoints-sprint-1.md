# Contratos mínimos da Sprint 1 (alinhados ao backend)

## Objetivo

Descrever os contratos HTTP usados para alinhar frontend, backend e revisão técnica com base nas user stories `US-01` a `US-07`, **espelhando o comportamento atual do serviço NestJS em `back/`**.

## Fonte de verdade

- **Implementação**: `back/src` (controllers, validators, use cases).
- **OpenAPI**: `GET /api/docs-json`, Swagger UI em `/api/docs`, Scalar em `/api/scalar` (com o servidor em execução).

Se este ficheiro e o OpenAPI divergirem, **prevalece o código e o OpenAPI gerado**.

---

## Convenções gerais

| Tópico | Valor no projeto |
| --- | --- |
| Prefixo global | `api` → todas as rotas começam por `/api/...` |
| Segmento `v1` | Usado **apenas** em `GET /api/v1` (resumo do sistema). Recursos como `users` e `leads` **não** usam `/api/v1/...`. |
| Formato | `application/json` |
| Autenticação | Access JWT: header `Authorization: Bearer <access>` **ou** cookie HttpOnly de access (configurável). Refresh opaco em cookie HttpOnly; ver rotas em `auth`. |
| Cookies | `POST /api/auth/login` e `POST /api/auth/refresh` definem cookies de access e refresh. Integração browser deve usar `credentials: 'include'` no CORS. |
| Respostas com corpo | Envelope global (ver abaixo). |
| Respostas sem corpo | `204 No Content` — **sem** envelope (ex.: `DELETE` de utilizador/lead, `POST /api/auth/logout`). |

### Papéis canónicos (domínio / API)

Valores exatos na API JSON: `ATTENDANT`, `MANAGER`, `GENERAL_MANAGER`, `ADMINISTRATOR`.

No PostgreSQL (Prisma), `ADMINISTRATOR` persiste como `ADMIN`; a API devolve sempre o nome canónico do domínio.

### Paginação

Onde existir listagem paginada (ex.: utilizadores): query `page` (base 1, pré-definido 1) e `limit` (1–100, pré-definido 20). **Não** se usa `offset`/`limit` neste recurso.

---

## Envelope global de resposta

### Sucesso (corpo JSON)

```json
{
  "success": true,
  "message": null,
  "data": {},
  "errors": null
}
```

O payload útil do endpoint fica em `data`. Para listagens paginadas de utilizadores, `data` inclui `items`, `page`, `limit`, `total`, `totalPages`.

### Erro

```json
{
  "success": false,
  "message": "Resumo legível do problema",
  "data": null,
  "errors": [
    {
      "code": "codigo.estavel",
      "message": "Mensagem",
      "field": "opcional",
      "details": {}
    }
  ]
}
```

Códigos HTTP usuais: `400` (validação / regra de negócio mapeada), `401`, `403`, `404`, `409` (conflito, ex.: e-mail duplicado), `429`, `500`, `503`.

---

## Auth (`US-01`; sessão e utilizador atual)

### `POST /api/auth/login`

- **Público** (`@Public()`).
- **Body**: `{ "email": "string", "password": "string" }` (senha mín. 8 caracteres).
- **200**: `data` com `{ "user": UserResponseDto, "accessToken": "string" }`. Cookies HttpOnly também recebem access e refresh.
- **401**: credenciais inválidas (envelope com código de domínio, ex. credenciais inválidas).

### `POST /api/auth/refresh`

- **Público**.
- Refresh lido do cookie HttpOnly ou, em alternativa, corpo opcional com `refreshToken` (o pipeline pode redigir o corpo em logs).
- **200**: `data` com `{ "accessToken": "string" }`; cookies renovados.
- **401**: refresh ausente ou inválido.

### `POST /api/auth/logout`

- **Público**.
- **204**: sem corpo; revoga sessão de refresh no servidor e limpa cookies de access/refresh.

### `GET /api/auth/me`

- **Autenticado** (JWT válido).
- **200**: `data` = `UserResponseDto` do utilizador.
- **401**: token inválido ou utilizador já não existe.

### `UserResponseDto` (campos)

- `id` (uuid), `name`, `email`, `role` (enum canónico), `teamId` (uuid \| null).

---

## US-02 — Atualização do próprio e-mail e senha

**Estado no repositório**: não existe rota dedicada (ex. não há `PUT /api/auth/credentials`). O requisito da US-02 continua válido no backlog de produto; a alteração de credenciais do próprio utilizador **ainda não** está exposta como recurso separado.

Até lá, alterações administrativas de utilizador seguem o CRUD em `/api/users/:id` (restrito a `ADMINISTRATOR` na implementação atual). Quando for implementada a US-02, este documento e o OpenAPI devem ser atualizados em conjunto.

---

## Utilizadores — `US-04`

Todas as rotas abaixo exigem JWT e papel `ADMINISTRATOR` (`@Roles('ADMINISTRATOR')`).

### `POST /api/users`

**Body** (campos obrigatórios salvo indicação):

- `name`, `email`, `password` (mín. 8), `role` (enum canónico)
- `teamId` opcional (`uuid` ou `null`)

**201**: `data` = utilizador criado.  
**409**: e-mail já existente.

### `GET /api/users`

**Query**: `page`, `limit` (paginação descrita acima).

**200**: `data` = `{ "items": [...], "page", "limit", "total", "totalPages" }`.

### `GET /api/users/:id`

**200**: `data` = utilizador.  
**404**: não encontrado.

### `PATCH /api/users/:id`

**Body**: campos opcionais — `name`, `email`, `password`, `role`, `teamId` (incl. `null` para desassociar equipa). Pelo menos um campo deve ser enviado (caso contrário erro de validação / domínio).

**200**: `data` = utilizador atualizado.  
**409**: e-mail em conflito.

### `DELETE /api/users/:id`

**204**: sem corpo.

---

## Equipas, lojas e clientes — `US-05`, `US-06`

**Estado no repositório**: não há controllers HTTP Nest para `teams`, `stores` ou `customers` neste momento. Modelos ou módulos podem existir ao nível de domínio/dados; as rotas REST da sprint **ainda não** estão disponíveis para integração.

**Convenção alvo** quando forem implementadas (para evitar nova divergência):

- Prefixo `/api/...` (sem `/api/v1/` no recurso).
- Mesmo envelope `{ success, message, data, errors }`.
- Papéis canónicos como acima.
- Listagens com `page` / `limit` alinhados ao padrão de `GET /api/users`.

---

## Leads — `US-07`

Rotas sob `@Controller('leads')`; todas autenticadas (guard global + JWT). O modelo de lead na API é enxuto: `id`, `customerId`, `storeId`, `ownerUserId`, `source`, `status`.

### Origem (`source`)

Valores permitidos: `store-visit`, `phone-call`, `whatsapp`, `instagram`, `digital-form`, `other`.

### Estado (`status`)

Valores: `NEW`, `CONTACTED`, `QUALIFIED`, `DISQUALIFIED`, `CONVERTED`.

### `POST /api/leads`

**Body**: `customerId`, `storeId`, `source`, `ownerUserId` opcional (`uuid` ou `null`).

**201**: `data` = lead.

### `GET /api/leads/owner/:ownerUserId`

**200**: `data` = array de leads (lista completa, sem paginação nesta rota).

### `GET /api/leads/team/:teamId`

**200**: `data` = array de leads.

### `GET /api/leads/:id`

**200**: `data` = lead.  
**404**: não encontrado.

### `PATCH /api/leads/:id`

**Body**: `customerId`, `storeId`, `source`, `ownerUserId` (opcional), `status` — conjunto completo conforme validator (atualização total dos campos mapeados).

**200**: `data` = lead.

### `PATCH /api/leads/:id/reassign`

**Body**: `ownerUserId` opcional (`uuid` ou `null`).

**200**: `data` = lead.

### `PATCH /api/leads/:id/convert`

**200**: `data` = lead com estado convertido.  
**409**: se o lead já estiver convertido.

### `DELETE /api/leads/:id`

**204**: sem corpo.

---

## Resumo de cobertura US ↔ API

| US | Situação na API atual |
| --- | --- |
| US-01 | `POST /api/auth/login`, refresh, logout, `GET /api/auth/me` |
| US-02 | Requisito em backlog; rota dedicada **não** implementada |
| US-03 | Guard global + `@Roles()` + JWT com `role`; escopo fino por listagem ainda evolui com RBAC |
| US-04 | CRUD `/api/users` (papel `ADMINISTRATOR`) |
| US-05 | Rotas HTTP **não** expostas |
| US-06 | Rotas HTTP **não** expostas |
| US-07 | Leads conforme secção acima (rotas diferentes de um único `GET /api/leads` paginado) |

---

## Rastreabilidade

| Documento | Ligação |
| --- | --- |
| Matriz US / RF | [traceability-endpoints-to-requirements.md](./traceability-endpoints-to-requirements.md) |
| Guia de implementação | [implementation-guide-sprint-1.md](./implementation-guide-sprint-1.md) |

**Versão**: 2.0  
**Atualizado em**: 2026-04-09  
**Nota**: Revisão para alinhar com o backend NestJS + Prisma vigente (envelope global, `/api`, papéis canónicos, Argon2, use cases).
