# API REST

## Objetivo

Registrar o contrato macro e o inventario real da API no estado atual da `main`.

## Prefixo atual

```text
/api
```

Nao ha versionamento por `/v1` na implementacao atual.

## Recursos ativos

- `/auth`
- `/users`
- `/teams`
- `/stores`
- `/customers`
- `/leads`
- `/dashboards`

## Recursos ainda nao fechados como produto

- `negotiations`
- `audit-logs`

## Regras operacionais

- JWT obrigatorio para rotas protegidas.
- `RBAC` aplicado exclusivamente no backend.
- Escopo organizacional resolvido com `memberTeamIds` e `managedTeamIds`.
- `teamId` permanece apenas como compatibilidade legada.
- Paginacao e filtros seguem query params explicitos.
- Respostas usam envelope de sucesso/erro consistente.

## Auth

### Endpoints relevantes

| Metodo | Caminho | Estado |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Funcional |
| `POST` | `/api/auth/refresh` | Funcional |
| `POST` | `/api/auth/logout` | Funcional |
| `GET` | `/api/auth/session` | Funcional, opcional, retorna `data: null` sem sessao |
| `GET` | `/api/auth/me` | Funcional, estrito, retorna `401` sem autenticacao |
| `PATCH` | `/api/auth/me/email` | Funcional |
| `PATCH` | `/api/auth/me/password` | Funcional |

## Contrato atual de utilizador

Campos canonicos de vinculo organizacional:

- `memberTeamIds`
- `managedTeamIds`

Campos administrativos complementares:

- `accessGroupId`
- `accessGroup`

Campo legado:

- `teamId`

## Leads

Rotas de listagem consumidas pelo frontend:

| Metodo | Caminho | Uso |
| --- | --- | --- |
| `GET` | `/api/leads/owner/:ownerUserId?page=&limit=` | Escopo por responsavel |
| `GET` | `/api/leads/manager?page=&limit=` | Escopo consolidado gerencial |
| `GET` | `/api/leads/team/:teamId?page=&limit=` | Listagem por equipa |
| `GET` | `/api/leads/all?page=&limit=` | Listagem global |

O frontend tambem ja usa rotas transacionais de lead para:

- criar;
- editar;
- reatribuir;
- converter;
- excluir.

## Dashboards

Rotas publicadas:

| Metodo | Caminho | Uso |
| --- | --- | --- |
| `GET` | `/api/dashboards/operational?startDate=&endDate=` | Indicadores operacionais (`RF04`) |

Contrato detalhado:

- [Dashboard Operacional - Contrato Backend](./dashboard-operational-contract.md)

## Observacoes de estado

- o backend ja suporta o nucleo transacional de Sprint 1;
- dashboard operacional ja esta publicado para consumo de frontend;
- analytics e logs administrativos ainda nao devem ser tratados como recursos concluidos.
