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
- `/vehicles`
- `/deals`
- `/dashboards`
- `audit-logs` como base de persistência e domínio

## Recursos ainda em fechamento final

- audit log completo, com cobertura ampla de eventos e consulta administrativa refinada, fica como frente da Sprint 3.

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
| `GET` | `/api/dashboards/analytic?mode=&referenceDate=&startDate=&endDate=&top=` | Indicadores analiticos e filtros temporais (`RF05`, `RF06`) |

Contrato detalhado:

- [Dashboard Operacional - Contrato Backend](./dashboard-operational-contract.md)
- [Dashboard Analitico - Contrato Backend](./dashboard-analytic-contract.md)

## Veículos

Rotas publicadas:

| Metodo | Caminho | Uso |
| --- | --- | --- |
| `POST` | `/api/vehicles` | Criar veiculo |
| `GET` | `/api/vehicles?storeId=&status=&withoutOpenDeal=` | Listar veiculos |
| `GET` | `/api/vehicles/catalog?page=&limit=&search=&storeId=&status=` | Catalogo enriquecido |
| `GET` | `/api/vehicles/:id` | Buscar veiculo |
| `PATCH` | `/api/vehicles/:id` | Atualizar veiculo |
| `DELETE` | `/api/vehicles/:id` | Inativar veiculo |
| `DELETE` | `/api/vehicles/:id/permanent` | Excluir permanentemente quando nao houver negociacoes vinculadas |

## Negociações

Rotas publicadas:

| Metodo | Caminho | Uso |
| --- | --- | --- |
| `POST` | `/api/leads/:leadId/deals` | Criar negociacao para lead |
| `GET` | `/api/leads/:leadId/deals` | Listar negociacoes do lead |
| `GET` | `/api/deals?storeId=&ownerUserId=&status=&page=&limit=` | Listar negociacoes por escopo |
| `GET` | `/api/deals/pipeline` | Pipeline de negociacoes por etapa |
| `GET` | `/api/deals/pipeline/stages/:stage` | Pagina de uma etapa do pipeline |
| `GET` | `/api/deals/:id/history` | Historico da negociacao |
| `GET` | `/api/deals/:id` | Buscar negociacao |
| `PATCH` | `/api/deals/:id` | Atualizar negociacao |
| `DELETE` | `/api/deals/:id` | Excluir negociacao |

## Observacoes de estado

- o backend ja suporta o nucleo transacional de Sprint 1;
- veiculos, negociacoes, dashboards operacional e analitico ja estao publicados para consumo do frontend;
- audit log possui base de schema, dominio e escrita auxiliar, mas a cobertura completa fica para a Sprint 3.
