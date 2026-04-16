# API REST

## Objetivo

Registrar o contrato macro e o inventário real da API no estado atual da `main`.

## Prefixo atual

```text
/api
```

Não há versionamento por `/v1` na implementação atual.

## Recursos ativos

- `/auth`
- `/users`
- `/teams`
- `/stores`
- `/customers`
- `/leads`

## Recursos ainda não fechados como produto

- `negotiations`
- `dashboards`
- `audit-logs`

## Regras operacionais

- JWT obrigatório para rotas protegidas.
- `RBAC` aplicado exclusivamente no backend.
- Escopo organizacional resolvido com `memberTeamIds` e `managedTeamIds`.
- `teamId` permanece apenas como compatibilidade legada.
- Paginação e filtros seguem query params explícitos.
- Respostas usam envelope de sucesso/erro consistente.

## Auth

### Endpoints relevantes

| Método | Caminho | Estado |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Funcional |
| `POST` | `/api/auth/refresh` | Funcional |
| `POST` | `/api/auth/logout` | Funcional |
| `GET` | `/api/auth/session` | Funcional, opcional, retorna `data: null` sem sessão |
| `GET` | `/api/auth/me` | Funcional, estrito, retorna `401` sem autenticação |
| `PATCH` | `/api/auth/me/email` | Funcional |
| `PATCH` | `/api/auth/me/password` | Funcional |

## Contrato atual de utilizador

Campos canônicos de vínculo organizacional:

- `memberTeamIds`
- `managedTeamIds`

Campos administrativos complementares:

- `accessGroupId`
- `accessGroup`

Campo legado:

- `teamId`

## Leads

Rotas de listagem consumidas pelo frontend:

| Método | Caminho | Uso |
| --- | --- | --- |
| `GET` | `/api/leads/owner/:ownerUserId?page=&limit=` | Escopo por responsável |
| `GET` | `/api/leads/manager?page=&limit=` | Escopo consolidado gerencial |
| `GET` | `/api/leads/team/:teamId?page=&limit=` | Listagem por equipa |
| `GET` | `/api/leads/all?page=&limit=` | Listagem global |

O frontend também já usa rotas transacionais de lead para:

- criar;
- editar;
- reatribuir;
- converter;
- excluir.

## Observações de estado

- o backend já suporta o núcleo transacional de Sprint 1;
- dashboards e analytics ainda não devem ser documentados como endpoints de produto concluídos;
- logs administrativos ainda não devem ser tratados como recurso publicado para o frontend.
