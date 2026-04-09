# Sprint 1 Backlog

## Objetivo

Detalhar o backlog operacional da Sprint 1, quebrando o escopo comprometido em frentes de trabalho e entregáveis concretos que orientem execução, acompanhamento diário e revisão ao final da sprint.

## Contexto

Este backlog deriva do `Product Backlog` e do `Sprint Planning` já aprovados. Ele representa o recorte executável da Sprint 1 e deve ser usado como guia prático para distribuição do trabalho e acompanhamento do progresso.

## Direção adotada

- Organizar o trabalho por frentes que reflitam dependências técnicas reais.
- Manter rastreabilidade entre épicos, user stories e tarefas da sprint.
- Favorecer entregas integráveis ao longo da sprint, em vez de blocos isolados sem valor demonstrável.
- Preservar o foco no fluxo transacional inicial do sistema.

## Escopo da sprint

### Épicos cobertos

- `EP-01` Identidade e Acesso
- `EP-02` Estrutura Organizacional
- `EP-03` Clientes e Leads

### User Stories comprometidas

- `US-01`
- `US-02`
- `US-03`
- `US-04`
- `US-05`
- `US-06`
- `US-07`

### User Story condicional

- `US-08`

## Backlog operacional por frente

### Frente 1 - Banco, modelagem e diagramas

| Item | Relacionamento | Entregável esperado |
| --- | --- | --- |
| Consolidar a modelagem relacional da Sprint 1 e produzir DER + diagramas de apoio | `US-01` a `US-07` | Base visual e relacional coerente com o fluxo principal |
| Criar ou ajustar migrations da Sprint 1 | `US-01` a `US-07` | Banco versionado para o escopo comprometido |
| Garantir chaves estrangeiras, constraints e integridade referencial | `US-04` a `US-07` | Persistência consistente e segura |
| Preparar seeds mínimos de referência quando necessário | `US-01`, `US-03`, `US-04`, `US-05` | Ambiente local reproduzível para desenvolvimento e demonstração |

### Frente 2 - Backend de acesso e segurança

| Item | Relacionamento | Entregável esperado |
| --- | --- | --- |
| Implementar autenticação com JWT | `US-01` | Login funcional com emissão de token |
| Implementar hash seguro de senha | `US-01`, `US-02` | Credenciais armazenadas de forma segura |
| Criar fluxo de atualização do próprio acesso | `US-02` | Endpoint protegido para alteração de credenciais |
| Implementar mecanismo de RBAC no backend | `US-03` | Restrições de acesso por perfil |
| Estruturar DTOs, use cases e controllers de acesso | `US-01`, `US-02`, `US-03` | Contratos mínimos da Sprint 1 estabilizados |

### Frente 3 - Backend administrativo e operacional

| Item | Relacionamento | Entregável esperado |
| --- | --- | --- |
| Criar módulo de usuários | `US-04` | CRUD inicial administrativo de usuários |
| Criar módulo de equipes | `US-05` | CRUD inicial de equipes |
| Criar módulo de lojas | `US-05` | Cadastro e manutenção de lojas |
| Criar módulo de clientes | `US-06` | Cadastro e atualização de clientes |
| Criar módulo de leads | `US-07` | Cadastro, listagem e edição de leads |
| Garantir vínculo entre usuário, equipe, loja, cliente e lead | `US-04` a `US-07` | Fluxo comercial inicial coerente com o domínio |
| Implementar escopo inicial por perfil nas consultas de leads | `US-08` | Controle de visibilidade, se houver capacidade na sprint |

### Frente 4 - Frontend inicial

| Item | Relacionamento | Entregável esperado |
| --- | --- | --- |
| Estruturar tela de login | `US-01` | Entrada funcional no sistema |
| Implementar fluxo de sessão autenticada | `US-01`, `US-02` | Navegação mínima com usuário autenticado |
| Preparar interface inicial para usuários | `US-04` | Operação administrativa básica |
| Preparar interface inicial para clientes | `US-06` | Cadastro e manutenção inicial |
| Preparar interface inicial para leads | `US-07` | Fluxo operacional básico do núcleo comercial |
| Integrar frontend e backend por contratos explícitos | `US-01` a `US-07` | Consumo HTTP/JSON consistente, sem depender de mocks como direção principal |
| Decidir por tela entre composição por recurso e endpoint agregador | `US-01` a `US-07` | Contratos do frontend estáveis e coerentes com o custo de cada tela |

### Frente 5 - Documentação e contratos

| Item | Relacionamento | Entregável esperado |
| --- | --- | --- |
| Atualizar documentação mínima de endpoints da Sprint 1 | `US-01` a `US-07` | Contratos documentados para o time |
| Manter backlog e planejamento sincronizados com refinamentos | Todas | Governança ágil consistente |
| Registrar decisões arquiteturais relevantes | Todas | Continuidade de contexto técnico |

## Sequência sugerida de execução

1. Banco, modelagem e diagramas
2. Backend de acesso e segurança
3. Backend administrativo e operacional
4. Frontend inicial
5. Documentação e contratos

## Dependências críticas

- Banco e modelagem precedem o fechamento dos módulos do backend.
- Autenticação precede a validação real de RBAC.
- RBAC precede a liberação segura das rotas administrativas.
- Usuários, equipes e lojas precedem o fluxo completo de leads.
- Clientes precedem o vínculo comercial completo dos leads.

## Critérios de acompanhamento

- Cada frente deve evoluir com PRs pequenos e integráveis.
- Bloqueios devem ser visíveis cedo, principalmente os ligados a modelagem e autorização.
- A sprint deve ser acompanhada pela capacidade de fechar fluxos, não apenas quantidade de arquivos produzidos.
- `US-08` só entra como compromisso principal se não comprometer o fechamento do goal.

## Riscos e atenção

- A modelagem relacional desta sprint concentra grande parte do risco de atraso.
- RBAC pode crescer demais se o time tentar resolver todos os cenários avançados de uma vez.
- O frontend pode ficar dependente demais do backend se os contratos mínimos não forem fechados cedo.
- O frontend pode degradar a manutenção se o time começar a criar endpoints agregadores para qualquer tela sem critério de domínio.
- O excesso de paralelismo sem integração frequente pode quebrar a coesão da sprint.

## Impactos e implicações

- Este backlog cria uma visão prática do trabalho da sprint e ajuda o time a sair do nível “história” para o nível “execução”.
- O documento reduz ambiguidade entre o que está comprometido e o que ainda é condicional.
- Ele também ajuda a separar claramente o que é entrega de Sprint 1 e o que deve ficar para as sprints seguintes.

## Snapshot operacional em `2026-04-07`

Este snapshot foi incluído para sincronizar backlog, planning e leitura real do `develop`.

### Blocos já materializados no repositório

- modelagem relacional base da Sprint 1;
- autenticação com JWT, login e guard global de autenticação;
- CRUD inicial de usuários;
- módulo de leads com criação, consulta, edição e operações centrais;
- decisão arquitetural sobre contratos por recurso e endpoint agregador por tela.

### Blocos ainda em aberto

- atualização do próprio acesso;
- módulos HTTP de equipes, lojas e clientes;
- seed mínimo utilizável;
- validação final de qualidade e demonstração ponta a ponta;
- fechamento do contrato mínimo do frontend autenticado.

### Leitura prática para acompanhamento diário

- `US-01`, `US-04` e parte de `US-07` já têm sustentação concreta no repositório;
- `US-02`, `US-05` e `US-06` ainda dependem de fechamento funcional real;
- `US-08` continua corretamente tratado como condicional.

## Próximos passos

1. Usar [`sprint-1-task-breakdown.md`](./sprint-1-task-breakdown.md) como base para quebrar os cards atribuíveis ao time.
2. Revisar diariamente se o progresso está preservando o Sprint Goal.
3. Atualizar o backlog ao final da sprint com o resultado real das entregas.
