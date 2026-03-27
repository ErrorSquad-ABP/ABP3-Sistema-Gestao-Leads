# Sprint 1 Task Board

## Objetivo

Traduzir o `Sprint 1 Backlog` em um conjunto de cards no formato `Trello/Kanban`, pronto para operação do time durante a Sprint 1.

## Contexto

O board desta sprint precisa transformar o backlog operacional em cards executáveis, pequenos o suficiente para acompanhamento diário e claros o suficiente para evitar retrabalho. Como o projeto terá três sprints, este documento foi nomeado explicitamente para a Sprint 1 e deve servir como referência isolada desse ciclo.

## Direção adotada

- Organizar os cards por título, labels e descrição.
- Manter rastreabilidade entre card, `US-*` e dependência técnica.
- Separar cards comprometidos dos cards condicionais.
- Usar nomes de listas com prefixo da sprint para evitar ambiguidade no quadro.

## Estrutura sugerida do quadro

### Listas do Trello/Kanban

- `Sprint 1 - Backlog`
- `Sprint 1 - Em andamento`
- `Sprint 1 - Em revisão`
- `Sprint 1 - Bloqueado`
- `Sprint 1 - Concluído`
- `Sprint 1 - Condicional`

## Etiquetas sugeridas

| Etiqueta | Uso |
| --- | --- |
| `backend` | Cards de API, domínio, autorização e persistência |
| `frontend` | Cards de interface e integração do front |
| `database` | Cards de schema, migration, seed e integridade relacional |
| `docs` | Cards de documentação, contratos e governança |
| `critical` | Cards que destravam outras entregas da sprint |
| `security` | Cards ligados a autenticação, autorização e proteção de dados |
| `conditional` | Cards que só entram com sobra de capacidade |

## Cards comprometidos da Sprint 1

### TK-01 - Modelar schema de usuários e papéis

- Labels: `database`, `backend`, `critical`, `security`
- Descrição: Definir a estrutura relacional de usuários, credenciais e papéis de acesso, sustentando `US-01`, `US-03` e `US-04`. O card deve entregar schema consistente para autenticação, RBAC e operação administrativa inicial.

### TK-02 - Modelar schema de equipes e lojas

- Labels: `database`, `backend`, `critical`
- Descrição: Definir tabelas e relacionamentos da estrutura organizacional para atender `US-05`. O resultado esperado é uma base relacional coerente para equipes, lojas e seus vínculos.

### TK-03 - Modelar schema de clientes e leads

- Labels: `database`, `backend`, `critical`
- Descrição: Estruturar o núcleo operacional da sprint para suportar `US-06` e `US-07`. O card deve fechar entidades, relacionamentos e campos mínimos para clientes e leads.

### TK-04 - Criar migrations da Sprint 1

- Labels: `database`, `critical`
- Descrição: Transformar a modelagem da Sprint 1 em migrations versionadas cobrindo `US-01` a `US-07`. O entregável é um banco reproduzível para desenvolvimento, revisão e demonstração.

### TK-05 - Preparar seeds mínimos de referência

- Labels: `database`
- Descrição: Criar dados mínimos para ambiente local e demonstração, especialmente para `US-01`, `US-03`, `US-04` e `US-05`. O card deve deixar o time apto a testar os fluxos sem preparação manual extensa.

### TK-06 - Implementar login com JWT

- Labels: `backend`, `critical`, `security`
- Descrição: Entregar o endpoint de autenticação previsto em `US-01`, com emissão de token JWT contendo identificação, papel e expiração. O fluxo deve estar pronto para consumo real pelo frontend.

### TK-07 - Implementar atualização do próprio acesso

- Labels: `backend`, `security`
- Descrição: Criar o fluxo protegido para atualização de e-mail e senha do próprio usuário, cobrindo `US-02`. O card só fecha com credenciais persistidas de forma segura e com regras mínimas validadas.

### TK-08 - Implementar guards e policies de RBAC

- Labels: `backend`, `critical`, `security`
- Descrição: Implementar o controle de acesso por perfil no backend para atender `US-03`. O entregável é a restrição efetiva de rotas e casos de uso conforme papel do usuário.

### TK-09 - Criar módulo de usuários

- Labels: `backend`
- Descrição: Implementar o CRUD inicial administrativo de usuários vinculado a `US-04`. O card deve cobrir a base mínima de criação, listagem, edição e exclusão conforme o papel administrador.

### TK-10 - Criar módulo de equipes e lojas

- Labels: `backend`
- Descrição: Implementar a operação inicial de equipes e o cadastro de lojas previstos em `US-05`. O card deve deixar a estrutura organizacional pronta para ser usada pelos módulos seguintes.

### TK-11 - Criar módulo de clientes

- Labels: `backend`
- Descrição: Entregar cadastro e atualização de clientes para atender `US-06`. O card deve suportar o vínculo posterior com leads sem retrabalho estrutural.

### TK-12 - Criar módulo de leads com vínculos completos

- Labels: `backend`, `critical`
- Descrição: Implementar cadastro, listagem e edição de leads vinculando cliente, loja e atendente, conforme `US-07`. O entregável é o fluxo operacional mínimo do núcleo comercial da Sprint 1.

### TK-13 - Estruturar tela de login e sessão

- Labels: `frontend`, `security`
- Descrição: Construir a entrada funcional no sistema para `US-01` e `US-02`, incluindo armazenamento de sessão autenticada mínima. O card deve deixar o frontend apto a consumir o login real.

### TK-14 - Criar interface inicial de usuários

- Labels: `frontend`
- Descrição: Criar a interface inicial para operação administrativa de usuários, refletindo `US-04`. O foco é viabilizar o fluxo base de gestão, não o acabamento final da experiência.

### TK-15 - Criar interface inicial de clientes

- Labels: `frontend`
- Descrição: Criar a interface inicial de cadastro e manutenção de clientes para `US-06`. O card deve permitir operação básica integrada ao backend.

### TK-16 - Criar interface inicial de leads

- Labels: `frontend`, `critical`
- Descrição: Implementar o fluxo visual mínimo para cadastro, listagem e edição de leads, cobrindo `US-07`. O entregável deve demonstrar o núcleo operacional da sprint do ponto de vista do usuário.

### TK-17 - Centralizar integração HTTP do frontend

- Labels: `frontend`, `backend`
- Descrição: Estruturar uma camada de integração HTTP reutilizável para os fluxos da Sprint 1, cobrindo `US-01` a `US-07`. O card existe para evitar chamadas espalhadas e contratos inconsistentes.

### TK-18 - Documentar endpoints mínimos da Sprint 1

- Labels: `docs`
- Descrição: Registrar os contratos mínimos de endpoints usados nesta sprint, com base em `US-01` a `US-07`. O resultado deve facilitar alinhamento entre frontend, backend e revisão técnica.

### TK-19 - Sincronizar backlog, planning e execução da sprint

- Labels: `docs`
- Descrição: Manter os artefatos ágeis coerentes com o andamento real da Sprint 1. O card fecha quando backlog, planning, goal e task board refletirem o estado efetivo da sprint.

## Cards condicionais da Sprint 1

### TK-20 - Aplicar escopo inicial de leads por perfil no backend

- Labels: `backend`, `security`, `conditional`
- Descrição: Aplicar controle inicial de visibilidade de leads por perfil, cobrindo `US-08`, apenas se `US-03` e `US-07` estiverem estáveis. Não deve competir com o compromisso principal da sprint.

### TK-21 - Refletir escopo inicial de leads na interface

- Labels: `frontend`, `conditional`
- Descrição: Refletir na interface o escopo inicial de leads por perfil, também ligado a `US-08`, somente se o backend correspondente já estiver funcional. É um card dependente e opcional nesta sprint.

## Ordem sugerida de puxada dos cards

1. `TK-01`
2. `TK-02`
3. `TK-03`
4. `TK-04`
5. `TK-06`
6. `TK-08`
7. `TK-09`
8. `TK-10`
9. `TK-11`
10. `TK-12`
11. `TK-13`
12. `TK-16`
13. `TK-17`
14. `TK-18`
15. `TK-19`

## Regras de uso do quadro

- Todo card comprometido começa em `Sprint 1 - Backlog`.
- Card só entra em `Sprint 1 - Em andamento` quando sua dependência crítica imediata estiver minimamente resolvida.
- Card em `Sprint 1 - Em revisão` deve apontar para PR, evidência de validação ou material equivalente.
- Card só vai para `Sprint 1 - Concluído` quando atender ao `Definition of Done`.
- Card bloqueado deve registrar impedimento objetivo.
- Card condicional não entra na execução principal sem validação explícita de capacidade.

## Impactos e implicações

- O quadro passa a refletir exatamente a Sprint 1, sem ambiguidade com sprints futuras.
- O formato de card fica pronto para criação manual no Trello ou adaptação para outra ferramenta Kanban.
- A rastreabilidade entre `US-*`, execução diária e entrega de sprint fica preservada.

## Próximos passos

1. Criar no Trello as listas com prefixo `Sprint 1 -`.
2. Criar os cards `TK-*` usando título, labels e descrição já definidos neste documento.
3. Distribuir responsáveis, datas e critérios de revisão no kickoff operacional da sprint.
