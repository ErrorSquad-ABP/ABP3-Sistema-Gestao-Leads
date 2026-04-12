# Documentação Sprint 1 — sumário executivo

## Objetivo

Centralizar referência aos **contratos HTTP vigentes** alinhados ao código em `back/`, para backend, frontend e revisão técnica.

**Importante**: a documentação em `docs/api/` foi revista para coincidir com o prefixo **`/api`**, envelope **`{ success, message, data, errors }`**, papéis canónicos (**`ADMINISTRATOR`**, **`GENERAL_MANAGER`**, etc.), **Prisma + Argon2** e guard **global**. Versões antigas que citavam `/api/v1` em todos os recursos, `PUT /auth/credentials` ou bcrypt eram **legado/proposta** e foram corrigidas.

---

## Estrutura de ficheiros

| Ficheiro | Conteúdo |
| --- | --- |
| [README.md](./README.md) | Visão geral da API e convenções |
| [endpoints-sprint-1.md](./endpoints-sprint-1.md) | Contratos detalhados (fonte de verdade textual + código) |
| [traceability-endpoints-to-requirements.md](./traceability-endpoints-to-requirements.md) | US-01–US-07 ↔ RF/RNF e gaps |
| [implementation-guide-sprint-1.md](./implementation-guide-sprint-1.md) | Padrão do repositório (use cases, Prisma, guard global) |
| **SPRINT-1-ENDPOINTS-SUMMARY.md** | Este índice rápido |

---

## Por onde começar

- **Backend**: [implementation-guide-sprint-1.md](./implementation-guide-sprint-1.md) + OpenAPI `/api/docs-json`.
- **Frontend / QA**: [endpoints-sprint-1.md](./endpoints-sprint-1.md) + Swagger `/api/docs`.
- **Arquitetura**: [traceability-endpoints-to-requirements.md](./traceability-endpoints-to-requirements.md).

---

## Endpoints implementados (resumo)

### Auth (`US-01`)

| Rota | Método | Auth | Descrição |
| --- | --- | --- | --- |
| `/api/auth/login` | `POST` | Pública | Login; cookies + JSON com `user` e `accessToken` |
| `/api/auth/refresh` | `POST` | Pública | Rota refresh; renova cookies |
| `/api/auth/logout` | `POST` | Pública | `204`; revoga sessão e limpa cookies |
| `/api/auth/me` | `GET` | JWT | Utilizador atual |

### Utilizadores (`US-04`)

| Rota | Método | Auth | Descrição |
| --- | --- | --- | --- |
| `/api/users` | `POST` | JWT + `ADMINISTRATOR` | Criar |
| `/api/users` | `GET` | JWT + `ADMINISTRATOR` | Listar (`page`, `limit`) |
| `/api/users/:id` | `GET` | JWT + `ADMINISTRATOR` | Detalhe |
| `/api/users/:id` | `PATCH` | JWT + `ADMINISTRATOR` | Atualizar |
| `/api/users/:id` | `DELETE` | JWT + `ADMINISTRATOR` | Remover (`204`) |

### Leads (`US-07`)

| Rota | Método | Descrição |
| --- | --- | --- |
| `/api/leads` | `POST` | Criar |
| `/api/leads/owner/:ownerUserId` | `GET` | Listar por dono |
| `/api/leads/team/:teamId` | `GET` | Listar por equipa |
| `/api/leads/:id` | `GET` | Detalhe |
| `/api/leads/:id` | `PATCH` | Atualizar |
| `/api/leads/:id/reassign` | `PATCH` | Reatribuir |
| `/api/leads/:id/convert` | `PATCH` | Converter |
| `/api/leads/:id` | `DELETE` | Remover (`204`) |

### Sistema

| Rota | Método | Descrição |
| --- | --- | --- |
| `/api/v1` | `GET` | Resumo do sistema (único path com segmento `v1`) |
| `/api/health` | `GET` | Health |

---

## Ainda não exposto em HTTP

- **US-02**: rota dedicada para o utilizador alterar o próprio e-mail/senha — **pendente** (ver contratos).
- **US-05** / **US-06**: recursos `teams`, `stores`, `customers` sem controllers REST nesta base.

---

## Papéis (valores JSON na API)

| Papel | Notas |
| --- | --- |
| `ATTENDANT` | Operacional |
| `MANAGER` | Gestão de equipa |
| `GENERAL_MANAGER` | Gestão alargada |
| `ADMINISTRATOR` | Administrador (persistido como `ADMIN` no Prisma) |

---

## Segurança

- Autorização efetiva no **backend** (`@Roles`, regras de domínio).
- Respostas de erro no **envelope** com `errors[].code` para o cliente tratar.

---

## Links rápidos

| Documento | Link |
| --- | --- |
| Contratos | [endpoints-sprint-1.md](./endpoints-sprint-1.md) |
| Rastreabilidade | [traceability-endpoints-to-requirements.md](./traceability-endpoints-to-requirements.md) |
| Guia de implementação | [implementation-guide-sprint-1.md](./implementation-guide-sprint-1.md) |
| Backlog | [sprint-1-backlog.md](../agile/sprint-1-backlog.md) |

---

## FAQ

**P.: Qual o prefixo da API?**  
R.: `/api`. Recursos não usam `/api/v1/` no path, exceto `GET /api/v1` (resumo).

**P.: Qual o formato de sucesso?**  
R.: `{ "success": true, "message": null, "data": { ... }, "errors": null }`.

**P.: Onde está o contrato máquina-legível?**  
R.: `GET /api/docs-json` com o servidor a correr.

**P.: US-02 já tem endpoint?**  
R.: Não há rota dedicada documentada no backend; ver secção correspondente em [endpoints-sprint-1.md](./endpoints-sprint-1.md).

---

**Versão**: 2.0  
**Atualizado em**: 2026-04-09
