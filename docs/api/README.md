# API REST

## Direcao inicial

A API sera uma aplicacao `NestJS` separada, orientada a recursos, com versionamento por prefixo e contratos explicitos entre `front` e `back`.

Prefixo inicial sugerido:

```text
/api/v1
```

## Recursos previstos

- `/auth`
- `/users`
- `/teams`
- `/stores`
- `/customers`
- `/leads`
- `/negotiations`
- `/dashboards`
- `/audit-logs`

## Regras operacionais

- JWT obrigatorio para rotas protegidas.
- RBAC aplicado no backend conforme papel do usuario.
- Filtros temporais validados no servidor.
- Logs de acesso e operacoes com data, hora e usuario responsavel.
- Comunicacao com o frontend exclusivamente por `HTTP/JSON`.

## Convencoes propostas

- Respostas com payload consistente e codigos HTTP semanticos.
- Erros de dominio desacoplados da tecnologia de transporte.
- Paginacao e filtros sempre explicitos em query params.
- Recursos analiticos separados dos recursos transacionais quando necessario.
- Controllers do Nest funcionando apenas como adaptacao HTTP, sem concentrar regra de negocio.
- Decorators do Nest usados para roteamento, documentacao e composicao dos contratos da API.
- Swagger disponivel para documentacao tecnica inicial da API.

## Estado atual da Sprint 1

- `teams` possui CRUD inicial administrativo com `POST`, `GET`, `GET :id`, `PATCH :id` e `DELETE :id`.
- `stores` possui CRUD inicial administrativo com `POST`, `GET`, `GET :id`, `PATCH :id` e `DELETE :id`.
- Os endpoints de `PATCH` em `teams` e `stores` aceitam atualizacao parcial e retornam `400` quando nenhum campo e enviado.
- `teams` valida previamente `managerId` e `storeId`, aceitando apenas usuarios com papel compativel com gerencia e lojas existentes para fechar o vinculo organizacional basico.
- `stores` retorna conflito de negocio ao tentar excluir loja ainda vinculada a leads.

## Proximos passos

### Regra de decisão

| Cenário | Estratégia |
| --- | --- |
| CRUD e telas simples | Endpoints por recurso |
| Recurso principal com dados auxiliares independentes | Recurso principal + subrotas |
| Dashboard e visão consolidada | Endpoint agregador por tela |
| Detalhe muito complexo e sempre carregado em bloco | Endpoint de composição específico, se justificado |

```mermaid
flowchart TD
  A[Tela ou caso de uso] --> B{Dados pertencem a um recurso\nprincipal bem definido?}
  B -->|Sim| C[Modelar endpoint por recurso]
  C --> D{Existe bloco relacionado\nque merece autonomia?}
  D -->|Sim| E[Criar subrota especifica]
  D -->|Nao| F[Manter no endpoint principal]
  B -->|Nao| G{Tela sempre exige carga\nconsolidada de muitos blocos?}
  G -->|Sim| H[Criar endpoint agregador da tela]
  G -->|Nao| I[Compor no frontend com endpoints separados]
```

### Decisão atual do projeto

- `auth`, `users`, `teams`, `stores`, `customers` e `leads` seguem desenho por recurso.

#### Leads — listagem consumida pelo frontend (Sprint 1)

Rotas em `/app/leads` (autenticação obrigatória, envelope de sucesso habitual). O escopo efetivo segue `LeadAccessPolicy` no backend (equipas membro/gestor via `memberTeamIds` / `managedTeamIds`; `teamId` no DTO do utilizador é legado/compatibilidade).

| Método | Caminho | Uso na UI |
| --- | --- | --- |
| `GET` | `/api/leads/owner/:ownerUserId` | Atendente: próprio `id`. Gestores: owners no mesmo escopo de equipas. |
| `GET` | `/api/leads/team/:teamId` | Gestor: `teamId` nas equipas legíveis (membro ∪ gestor conforme papel). |
| `GET` | `/api/leads/all` | `ADMINISTRATOR` e `GENERAL_MANAGER`: listagem global. |

Corpo de cada item: `id`, `customerId`, `storeId`, `ownerUserId`, `source`, `status` (ver Swagger / `LeadResponseDto`).

- `dashboards` podem e devem ter endpoints agregadores por tela.
- o detalhe de lead deve começar simples, com recurso principal e subrotas como histórico; só deve ganhar endpoint de composição se houver ganho real de desempenho e simplicidade.
- a API não deve nascer acoplada à UI inteira; agregação é exceção consciente, não regra padrão.

1. Definir contratos mínimos da Sprint 1.
2. Criar documentação de endpoints por módulo.
3. Padronizar formato de erro e metadados de paginação.
