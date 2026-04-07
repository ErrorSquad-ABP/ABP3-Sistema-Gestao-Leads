# Sprint 1 Task Breakdown

## Objetivo

Quebrar o backlog da Sprint 1 em tarefas operacionais menores, atribuíveis e fáceis de acompanhar no fluxo diário do time. Este documento existe para transformar o backlog da sprint em trabalho real de execução, com dependências explícitas, critérios mínimos e granularidade suficiente para Trello ou outro quadro `scrumban`.

## Como este documento se relaciona com os outros

- [sprint-1-goal.md](./sprint-1-goal.md): define o objetivo central da sprint.
- [sprint-1-planning.md](./sprint-1-planning.md): formaliza o planejamento e o escopo comprometido.
- [sprint-1-backlog.md](./sprint-1-backlog.md): mantém a visão operacional por frente.
- Este arquivo: quebra a Sprint 1 em tarefas menores, prontas para acompanhamento diário.

## Direção adotada

- Quebrar o trabalho até o ponto em que cada card represente uma entrega clara.
- Evitar cards gigantes do tipo “criar módulo X” sem definição de saída.
- Preservar dependências reais entre modelagem, backend, frontend e documentação.
- Manter foco no incremento mínimo demonstrável da Sprint 1.

## Escopo coberto

### User Stories principais

- `US-01`
- `US-02`
- `US-03`
- `US-04`
- `US-05`
- `US-06`
- `US-07`

### User Story condicional

- `US-08`

## Sugestão de uso em Scrumban

### Listas sugeridas

- `Backlog da Sprint`
- `Ready`
- `Doing`
- `Review`
- `Blocked`
- `Done`

### Limites de WIP sugeridos

- `Doing`: máximo de 5 cards no total
- `Review`: máximo de 3 cards
- Backend crítico: no máximo 2 cards simultâneos por pessoa
- Frontend: no máximo 2 cards simultâneos por pessoa

### Regra prática

Se um card não cabe em 1 a 2 dias úteis de esforço focado, ele provavelmente ainda está grande demais.

## Quebra operacional da Sprint 1

## Frente 1 - Banco, modelagem e base relacional

| ID | Tarefa | Relacionamento | Dependências | Entregável objetivo |
| --- | --- | --- | --- | --- |
| `S1-DAT-01` | Consolidar entidades e relacionamentos do recorte da Sprint 1 | `US-01` a `US-07` | Requisitos do edital | Lista final de entidades, vínculos e cardinalidades |
| `S1-DAT-02` | Revisar papéis e escopos necessários no modelo de usuários | `US-01`, `US-03`, `US-04` | `S1-DAT-01` | Modelo de `users` compatível com autenticação e RBAC |
| `S1-DAT-03` | Revisar modelagem de equipes e lojas | `US-05` | `S1-DAT-01` | Estrutura organizacional consistente |
| `S1-DAT-04` | Revisar modelagem de clientes e leads com vínculos obrigatórios | `US-06`, `US-07` | `S1-DAT-01`, `S1-DAT-03` | Fluxo comercial inicial coerente |
| `S1-DAT-05` | Atualizar schema e migrations do banco para o escopo da sprint | `US-01` a `US-07` | `S1-DAT-02`, `S1-DAT-03`, `S1-DAT-04` | Banco versionado para desenvolvimento |
| `S1-DAT-06` | Garantir constraints, FKs e integridade referencial | `US-04` a `US-07` | `S1-DAT-05` | Persistência consistente |
| `S1-DAT-07` | Preparar seeds mínimos para autenticação e dados mestres | `US-01`, `US-03`, `US-04`, `US-05` | `S1-DAT-05` | Ambiente local reproduzível |
| `S1-DAT-08` | Atualizar DER e diagramas da Sprint 1 | `US-01` a `US-07` | `S1-DAT-05` | Artefato visual coerente com o banco real |

## Frente 2 - Backend de autenticação e segurança

| ID | Tarefa | Relacionamento | Dependências | Entregável objetivo |
| --- | --- | --- | --- | --- |
| `S1-AUTH-01` | Estruturar módulo `auth` com responsabilidades mínimas | `US-01`, `US-02`, `US-03` | `S1-DAT-02` | Módulo de acesso organizado por camadas |
| `S1-AUTH-02` | Implementar hash seguro de senha | `US-01`, `US-02` | `S1-AUTH-01` | Senhas não trafegam nem persistem em texto puro |
| `S1-AUTH-03` | Implementar validação de credenciais | `US-01` | `S1-AUTH-01`, `S1-AUTH-02` | Autenticação funcional |
| `S1-AUTH-04` | Implementar emissão de JWT com `userId`, `role` e expiração | `US-01` | `S1-AUTH-03` | Token aderente ao edital |
| `S1-AUTH-05` | Expor endpoint de login | `US-01` | `S1-AUTH-03`, `S1-AUTH-04` | Contrato HTTP de autenticação |
| `S1-AUTH-06` | Implementar endpoint de atualização do próprio e-mail | `US-02` | `S1-AUTH-01` | Fluxo protegido para atualização de e-mail |
| `S1-AUTH-07` | Implementar endpoint de atualização da própria senha | `US-02` | `S1-AUTH-01`, `S1-AUTH-02` | Fluxo protegido para atualização de senha |
| `S1-AUTH-08` | Implementar mecanismo base de autenticação nas rotas protegidas | `US-01`, `US-02`, `US-03` | `S1-AUTH-04`, `S1-AUTH-05` | Guard ou middleware funcional |
| `S1-AUTH-09` | Implementar RBAC por perfil no backend | `US-03` | `S1-AUTH-08` | Restrições por papel aplicadas no servidor |
| `S1-AUTH-10` | Cobrir cenário mínimo de erro e resposta de acesso negado | `US-03` | `S1-AUTH-09` | Retornos previsíveis para `401` e `403` |

## Frente 3 - Backend administrativo de usuários, equipes e lojas

| ID | Tarefa | Relacionamento | Dependências | Entregável objetivo |
| --- | --- | --- | --- | --- |
| `S1-ADM-01` | Estruturar módulo de usuários | `US-04` | `S1-DAT-02` | Módulo `users` pronto para CRUD |
| `S1-ADM-02` | Implementar listagem administrativa de usuários | `US-04` | `S1-ADM-01`, `S1-AUTH-09` | Consulta administrativa funcional |
| `S1-ADM-03` | Implementar criação e edição de usuários | `US-04` | `S1-ADM-01`, `S1-AUTH-09` | Gestão inicial de utilizadores |
| `S1-ADM-04` | Estruturar módulo de equipes | `US-05` | `S1-DAT-03` | Módulo `teams` pronto para CRUD |
| `S1-ADM-05` | Implementar CRUD inicial de equipes | `US-05` | `S1-ADM-04`, `S1-AUTH-09` | Equipes operáveis |
| `S1-ADM-06` | Estruturar módulo de lojas | `US-05` | `S1-DAT-03` | Módulo `stores` pronto para CRUD |
| `S1-ADM-07` | Implementar CRUD inicial de lojas | `US-05` | `S1-ADM-06`, `S1-AUTH-09` | Lojas operáveis |
| `S1-ADM-08` | Implementar vínculos básicos entre usuário, equipe e loja | `US-04`, `US-05` | `S1-ADM-03`, `S1-ADM-05`, `S1-ADM-07` | Estrutura organizacional utilizável |

## Frente 4 - Backend de clientes e leads

| ID | Tarefa | Relacionamento | Dependências | Entregável objetivo |
| --- | --- | --- | --- | --- |
| `S1-CRM-01` | Estruturar módulo de clientes | `US-06` | `S1-DAT-04` | Módulo `customers` organizado |
| `S1-CRM-02` | Implementar cadastro e edição de clientes | `US-06` | `S1-CRM-01`, `S1-AUTH-09` | Clientes operáveis |
| `S1-CRM-03` | Implementar listagem de clientes | `US-06` | `S1-CRM-01`, `S1-AUTH-09` | Consulta inicial de clientes |
| `S1-CRM-04` | Estruturar módulo de leads | `US-07` | `S1-DAT-04` | Módulo `leads` organizado |
| `S1-CRM-05` | Implementar cadastro de leads com vínculo completo | `US-07` | `S1-CRM-04`, `S1-ADM-08`, `S1-CRM-02`, `S1-AUTH-09` | Lead criado com cliente, loja e atendente |
| `S1-CRM-06` | Implementar edição de leads | `US-07` | `S1-CRM-05`, `S1-AUTH-09` | Atualização mínima do lead |
| `S1-CRM-07` | Implementar listagem de leads | `US-07` | `S1-CRM-04`, `S1-AUTH-09` | Consulta do núcleo comercial |
| `S1-CRM-08` | Implementar detalhamento básico de lead | `US-07` | `S1-CRM-05`, `S1-CRM-07` | Resposta rica o suficiente para frontend |
| `S1-CRM-09` | Implementar escopo inicial por perfil nas consultas de leads | `US-08` | `S1-AUTH-09`, `S1-CRM-07` | Visibilidade inicial por papel |

## Frente 5 - Frontend de acesso e sessão

| ID | Tarefa | Relacionamento | Dependências | Entregável objetivo |
| --- | --- | --- | --- | --- |
| `S1-FRONT-01` | Fechar contratos mínimos do frontend para a sprint | `US-01` a `US-07` | `S1-AUTH-05`, `S1-ADM-02`, `S1-CRM-03`, `S1-CRM-07` | Mapa de rotas, contratos e estratégia de composição por tela estável |
| `S1-FRONT-02` | Implementar tela de login | `US-01` | `S1-FRONT-01`, `S1-AUTH-05` | Entrada funcional no sistema |
| `S1-FRONT-03` | Implementar sessão autenticada e redirecionamento inicial | `US-01` | `S1-FRONT-02`, `S1-AUTH-08` | Navegação mínima protegida |
| `S1-FRONT-04` | Implementar tela de perfil para atualização do próprio acesso | `US-02` | `S1-FRONT-03`, `S1-AUTH-06`, `S1-AUTH-07` | Fluxo de perfil funcional |
| `S1-FRONT-05` | Implementar tratamento visual de `401` e `403` | `US-01`, `US-03` | `S1-FRONT-03`, `S1-AUTH-10` | Estados mínimos de segurança na UI |

## Frente 6 - Frontend administrativo e operacional inicial

| ID | Tarefa | Relacionamento | Dependências | Entregável objetivo |
| --- | --- | --- | --- | --- |
| `S1-FRONT-06` | Preparar shell autenticado mínimo | `US-01` a `US-07` | `S1-FRONT-03` | Layout inicial para áreas protegidas |
| `S1-FRONT-07` | Implementar interface inicial de usuários | `US-04` | `S1-FRONT-06`, `S1-ADM-02`, `S1-ADM-03` | Operação administrativa básica |
| `S1-FRONT-08` | Implementar interface inicial de equipes | `US-05` | `S1-FRONT-06`, `S1-ADM-05` | Gestão mínima de equipes |
| `S1-FRONT-09` | Implementar interface inicial de lojas | `US-05` | `S1-FRONT-06`, `S1-ADM-07` | Gestão mínima de lojas |
| `S1-FRONT-10` | Implementar interface inicial de clientes | `US-06` | `S1-FRONT-06`, `S1-CRM-02`, `S1-CRM-03` | Cadastro e consulta inicial de clientes |
| `S1-FRONT-11` | Implementar listagem inicial de leads | `US-07` | `S1-FRONT-06`, `S1-CRM-07` | Fluxo operacional básico dos leads |
| `S1-FRONT-12` | Implementar criação de lead no frontend | `US-07` | `S1-FRONT-11`, `S1-CRM-05`, `S1-CRM-03`, `S1-ADM-07` | Lead criado pela UI |
| `S1-FRONT-13` | Implementar edição inicial de lead no frontend | `US-07` | `S1-FRONT-11`, `S1-CRM-06` | Lead editável pela UI |
| `S1-FRONT-14` | Refletir escopo visual básico de leads por papel | `US-08` | `S1-FRONT-11`, `S1-CRM-09` | Interface coerente com visibilidade inicial |

## Frente 7 - Documentação, contratos e fechamento da sprint

| ID | Tarefa | Relacionamento | Dependências | Entregável objetivo |
| --- | --- | --- | --- | --- |
| `S1-DOC-01` | Atualizar contratos mínimos de autenticação | `US-01`, `US-02` | `S1-AUTH-05`, `S1-AUTH-06`, `S1-AUTH-07` | `docs/api` coerente com auth real |
| `S1-DOC-02` | Atualizar contratos mínimos de usuários, equipes e lojas | `US-04`, `US-05` | `S1-ADM-03`, `S1-ADM-05`, `S1-ADM-07` | Documentação mínima das rotas administrativas |
| `S1-DOC-03` | Atualizar contratos mínimos de clientes e leads | `US-06`, `US-07` | `S1-CRM-02`, `S1-CRM-07`, `S1-CRM-08` | Documentação mínima do fluxo comercial |
| `S1-DOC-04` | Sincronizar backlog, planning e estado real da sprint | Todas | Execução em curso | Artefatos ágeis coerentes |
| `S1-DOC-05` | Registrar decisões arquiteturais que surgirem durante a sprint | Todas | Demandas reais | Continuidade de contexto técnico, incluindo decisão entre subrotas e endpoint agregador por tela |
| `S1-QA-01` | Validar fluxo mínimo ponta a ponta em ambiente local | `US-01` a `US-07` | Módulos principais concluídos | Demonstração funcional da sprint |
| `S1-QA-02` | Validar build, lint, typecheck e subida via Docker | Todas | `S1-QA-01` | Critérios de qualidade atendidos |

## Sequência sugerida

### Ordem de ataque mais segura

1. `S1-DAT-01` a `S1-DAT-08`
2. `S1-AUTH-01` a `S1-AUTH-10`
3. `S1-ADM-01` a `S1-ADM-08`
4. `S1-CRM-01` a `S1-CRM-08`
5. `S1-FRONT-01` a `S1-FRONT-13`
6. `S1-DOC-01` a `S1-QA-02`

### Ordem de corte se a sprint apertar

1. `S1-CRM-09`
2. `S1-FRONT-14`
3. refinamentos visuais não essenciais nas interfaces administrativas

## Sugestão de agrupamento para Trello

### Cartões que podem permanecer separados

- todas as tarefas `S1-AUTH-*`
- todas as tarefas `S1-CRM-*`
- todas as tarefas `S1-FRONT-*`

### Cartões que podem ser agrupados se o board ficar poluído demais

- `S1-DAT-02` + `S1-DAT-03` + `S1-DAT-04`
- `S1-DOC-01` + `S1-DOC-02` + `S1-DOC-03`
- `S1-QA-01` + `S1-QA-02`

## Critérios mínimos por tarefa

Antes de mover um card para `Done`, o time deve conseguir responder:

- qual era a saída concreta dessa tarefa;
- em qual módulo, tela ou artefato ela terminou;
- se há dependência desbloqueada por ela;
- se existe impacto documental ou contratual a atualizar.

## Estado real sincronizado em `2026-04-07`

Esta seção existe para manter o breakdown coerente com o board da sprint e com o que já está integrado em `develop`.

### Concluídas ou já sustentadas pelo repositório

- `S1-DAT-01` a `S1-DAT-06`
- `S1-AUTH-01` a `S1-AUTH-05`
- `S1-AUTH-08`
- `S1-ADM-01` a `S1-ADM-03`
- `S1-CRM-04` a `S1-CRM-08`
- `S1-DOC-05`

### Em andamento

- `S1-DOC-04`
- `S1-AUTH-09`
- `S1-AUTH-10`
- `S1-FRONT-01`

### Abertas e ainda não fechadas no repositório

- `S1-AUTH-06` e `S1-AUTH-07`
- `S1-ADM-04` a `S1-ADM-08`
- `S1-CRM-01` a `S1-CRM-03`
- `S1-DAT-07`
- `S1-QA-01` e `S1-QA-02`

### Escopo condicional mantido como corte

- `S1-CRM-09`
- `S1-FRONT-14`

## Próximos passos

1. Transformar esta quebra em cards de Trello.
2. Associar responsáveis e pares de revisão por frente.
3. Revisar diariamente se a granularidade ainda está boa ou se algum card precisa ser quebrado de novo.
