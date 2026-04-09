# Rastreabilidade: Endpoints → User Stories → Requisitos

## Propósito

Ligar endpoints HTTP, user stories (`US-01`–`US-07`), requisitos funcionais (RF) e não funcionais (RNF), **sem assumir rotas ou stacks que já não existem no repositório**.

**Prefixo das rotas**: salvo nota explícita, caminhos abaixo são relativos ao prefixo global **`/api`** (ex.: `POST /api/auth/login`).

**Papéis na API** (domínio): `ATTENDANT`, `MANAGER`, `GENERAL_MANAGER`, `ADMINISTRATOR` (não usar `ADMIN` / `MANAGER_GERAL` como valores JSON).

---

## Mapa de rastreabilidade

### EP-01 — Identidade e acesso

#### US-01: Autenticação por e-mail e senha com JWT

| Dimensão | Descrição |
| --- | --- |
| **Endpoints (implementados)** | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` |
| **RF / RNF** | `RF01`, `RNF02`, `RNF12` |
| **Notas** | Access JWT + refresh opaco em cookie; hash Argon2 no utilizador |

#### US-02: Atualização do próprio e-mail e senha

| Dimensão | Descrição |
| --- | --- |
| **Endpoints (alvo original)** | Rota dedicada tipo “credenciais do próprio utilizador” **ainda não** existe no backend |
| **RF / RNF** | `RF01`, `RNF02`, `RNF05` |
| **Gap** | Documentar e implementar em sincronia com `endpoints-sprint-1.md` e OpenAPI; até lá não há contrato HTTP estável para QA integrar |

#### US-03: RBAC no backend

| Dimensão | Descrição |
| --- | --- |
| **Implementação** | `GlobalAuthGuard`, `@Public()`, `@Roles()`; JWT com `role` canónico |
| **RF / RNF** | `RF02`, `RNF02`, `RNF11`, `RNF12`, `RNF13` |
| **Nota** | Escopo por papel em listagens (ex.: leads por owner/team) é parcial; evoluir com regras de negócio |

### EP-02 — Estrutura organizacional

#### US-04: Módulo de utilizadores

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | `POST /api/users`, `GET /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id` |
| **Autorização atual** | CRUD restrito a `ADMINISTRATOR` |
| **Paginação** | `page` / `limit` em `GET /api/users` |

#### US-05: Equipas e lojas

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | **Não** há rotas HTTP Nest para `teams` / `stores` neste repositório |
| **RF** | `RF02` — cobertura API pendente |

### EP-03 — Clientes e leads

#### US-06: Clientes

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | **Não** há `customers` HTTP neste repositório |
| **RF** | `RF02` — cobertura API pendente |

#### US-07: Leads

| Dimensão | Descrição |
| --- | --- |
| **Endpoints (implementados)** | `POST /api/leads`, `GET /api/leads/owner/:ownerUserId`, `GET /api/leads/team/:teamId`, `GET /api/leads/:id`, `PATCH /api/leads/:id`, `PATCH /api/leads/:id/reassign`, `PATCH /api/leads/:id/convert`, `DELETE /api/leads/:id` |
| **RF** | `RF02`, `RF04` (dados base para operação) |
| **Nota** | Não existe `GET /api/leads` paginado único; listagens por owner ou por equipa |

---

## Matriz RF (resumo)

| RF | US | Ligação à API atual |
| --- | --- | --- |
| `RF01` | US-01, US-02 | Login/refresh/logout/me implementados; atualização de credenciais “self-service” pendente |
| `RF02` | US-03–07 | RBAC + users + leads; teams/stores/customers sem HTTP |
| `RF04` | US-07 | Leads expostos; dashboards posteriores |

---

## Checklist de alinhamento técnico

- [ ] Contratos em [endpoints-sprint-1.md](./endpoints-sprint-1.md) conferidos com `GET /api/docs-json`.
- [ ] Frontend usa envelope `success` / `data` / `errors` e trata `204` sem JSON.
- [ ] Papéis e paginação (`page`/`limit`) consistentes com o backend.
- [ ] PRs que alterem controllers atualizam documentação e Swagger.

---

## Referências

- [endpoints-sprint-1.md](./endpoints-sprint-1.md)
- [implementation-guide-sprint-1.md](./implementation-guide-sprint-1.md)
- [product-backlog.md](../agile/product-backlog.md)

**Versão**: 2.0  
**Atualizado em**: 2026-04-09
