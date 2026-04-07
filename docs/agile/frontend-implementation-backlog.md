# Frontend Implementation Backlog

## Objetivo

Detalhar um backlog operacional do frontend em formato fácil de transpor para Trello, alinhado ao documento [frontend-information-architecture.md](../architecture/frontend-information-architecture.md) e ao recorte do ABP.

Este backlog não substitui o `Product Backlog` nem os backlogs de sprint. Ele existe para quebrar a frente de frontend em cartões executáveis, com dependências, foco de entrega e critérios mínimos de aceite.

## Como usar no Trello

Sugestão de listas:

- `Refinado`
- `Pronto para sprint`
- `Em andamento`
- `Bloqueado`
- `Em revisão`
- `Concluído`

Sugestão de labels:

- `frontend`
- `auth`
- `leads`
- `customers`
- `negotiations`
- `dashboard`
- `admin`
- `docs`
- `blocked-by-backend`

## Visão resumida dos cartões

| ID | Cartão | Sprint sugerida | Dependências principais |
| --- | --- | --- | --- |
| `FRONT-01` | Fechar rotas, contratos mínimos e mapa de estados | Sprint 1 | Documento de frontend, contratos de backend |
| `FRONT-02` | Definir tokens visuais e referências de UI | Sprint 1 | `FRONT-01` |
| `FRONT-03` | Implementar `AppShell` e navegação base | Sprint 1 | `FRONT-01`, `FRONT-02` |
| `FRONT-04` | Implementar login e sessão autenticada | Sprint 1 | `FRONT-01`, backend `auth` |
| `FRONT-05` | Implementar perfil e atualização de credenciais | Sprint 1 | `FRONT-04`, backend `auth` |
| `FRONT-06` | Implementar listagem e filtros de leads | Sprint 1 | `FRONT-03`, `FRONT-04`, backend `leads` |
| `FRONT-07` | Implementar criação e edição de lead | Sprint 1 | `FRONT-06`, backend `leads/customers/stores/users` |
| `FRONT-08` | Implementar detalhe do lead | Sprint 2 | `FRONT-06`, `FRONT-07`, backend `leads` |
| `FRONT-09` | Integrar cliente ao fluxo operacional | Sprint 2 | `FRONT-07`, `FRONT-08`, backend `customers` |
| `FRONT-10` | Implementar negociação ativa do lead | Sprint 2 | `FRONT-08`, backend `negotiations` |
| `FRONT-11` | Implementar histórico e timeline da negociação | Sprint 2 | `FRONT-10`, backend `history` |
| `FRONT-12` | Implementar dashboard operacional | Sprint 3 | `FRONT-03`, backend `dashboards` |
| `FRONT-13` | Implementar dashboard analítico | Sprint 3 | `FRONT-12`, backend `dashboards` |
| `FRONT-14` | Implementar equipes e vínculos | Sprint 3 | `FRONT-03`, backend `teams/users` |
| `FRONT-15` | Implementar gestão administrativa de usuários | Sprint 3 | `FRONT-03`, backend `users` |
| `FRONT-16` | Implementar gestão de lojas | Sprint 3 | `FRONT-03`, backend `stores` |
| `FRONT-17` | Implementar logs administrativos | Sprint 3 | `FRONT-03`, backend `audit-logs` |
| `FRONT-18` | Consolidar responsividade, estados e RBAC visual | Sprint 3 | Todos os fluxos principais |

## Cartões detalhados

### `FRONT-01` - Fechar rotas, contratos mínimos e mapa de estados

- Objetivo: impedir que o frontend comece a codar com rotas e contratos implícitos.
- Labels: `frontend`, `docs`
- Checklist:
- validar as rotas-alvo do `App Router`
- fechar os contratos mínimos com backend para `auth`, `leads`, `customers`, `negotiations`, `dashboards` e `audit-logs`
- listar estados obrigatórios por tela: `loading`, `empty`, `error`, `403`
- confirmar homes por papel
- Aceite:
- time consegue apontar qual endpoint alimenta cada tela principal
- não existe rota crítica sem contrato-alvo descrito

### `FRONT-02` - Definir tokens visuais e referências de UI

- Objetivo: fixar direção visual antes de montar componentes e páginas.
- Labels: `frontend`, `docs`
- Checklist:
- validar paleta base inspirada na marca
- escolher blocos de referência `shadcn` para login, shell, tabelas e dashboards
- definir decisões mínimas de tipografia, radius, spacing e semântica de cores
- produzir um guia curto de componentes-chave
- Aceite:
- o time consegue montar telas sem redecidir visual a cada feature

### `FRONT-03` - Implementar `AppShell` e navegação base

- Objetivo: entregar o esqueleto autenticado da aplicação.
- Labels: `frontend`
- Checklist:
- criar layout protegido
- implementar sidebar
- implementar topbar com contexto e menu de utilizador
- preparar redirecionamento inicial por papel
- criar rota de `403`
- Aceite:
- a aplicação autenticada possui navegação consistente entre áreas

### `FRONT-04` - Implementar login e sessão autenticada

- Objetivo: fechar o fluxo inicial de acesso.
- Labels: `frontend`, `auth`
- Checklist:
- implementar tela de login
- integrar `POST /auth/login`
- armazenar sessão de forma coerente com a estratégia escolhida
- bloquear acesso a rotas protegidas sem sessão válida
- redirecionar utilizador para home por papel
- Aceite:
- utilizador autenticado entra no sistema e navega para a área correta

### `FRONT-05` - Implementar perfil e atualização de credenciais

- Objetivo: cobrir a parte restante do `RF01` no frontend.
- Labels: `frontend`, `auth`
- Checklist:
- criar tela de perfil
- integrar leitura de `me`
- integrar atualização de e-mail
- integrar atualização de senha
- tratar mensagens de sucesso e erro
- Aceite:
- qualquer utilizador autenticado consegue atualizar as próprias credenciais

### `FRONT-06` - Implementar listagem e filtros de leads

- Objetivo: abrir o fluxo operacional principal do sistema.
- Labels: `frontend`, `leads`
- Checklist:
- criar tela de listagem de leads
- implementar filtros por origem, status e período
- implementar paginação ou navegação equivalente
- refletir escopo por papel na experiência visual
- tratar estado vazio e erro de consulta
- Aceite:
- atendente vê seus leads
- gerente vê leads da equipa
- admin consegue navegar sem restrições visuais indevidas

### `FRONT-07` - Implementar criação e edição de lead

- Objetivo: permitir operar o núcleo transacional inicial.
- Labels: `frontend`, `leads`
- Checklist:
- criar formulário de lead
- suportar criação e edição
- integrar seleção de cliente, loja e atendente quando aplicável
- tratar validações de formulário
- exibir feedback de sucesso e erro
- Aceite:
- lead pode ser criado e editado com vínculos básicos válidos

### `FRONT-08` - Implementar detalhe do lead

- Objetivo: consolidar a visão principal de contexto do lead.
- Labels: `frontend`, `leads`
- Checklist:
- criar página de detalhe
- exibir resumo do lead
- exibir dados do cliente vinculado
- exibir dados de loja e atendente
- reservar áreas claras para negociação e histórico
- Aceite:
- o detalhe do lead concentra o contexto necessário para operação da próxima fase

### `FRONT-09` - Integrar cliente ao fluxo operacional

- Objetivo: evitar que cliente fique solto como CRUD isolado.
- Labels: `frontend`, `customers`
- Checklist:
- criar listagem mínima de clientes
- suportar consulta e edição do cliente a partir do lead
- integrar formulários necessários
- garantir vínculo claro entre cliente e lead
- Aceite:
- cliente pode ser consultado e atualizado sem quebrar o fluxo do lead

### `FRONT-10` - Implementar negociação ativa do lead

- Objetivo: cobrir a parte central do `RF03`.
- Labels: `frontend`, `negotiations`
- Checklist:
- criar bloco ou aba de negociação no detalhe do lead
- integrar criação da negociação do lead
- integrar edição de importância, estágio, status e situação
- tratar regra visual de negociação ativa única
- exibir erros vindos da API em conflito de regra
- Aceite:
- utilizador autorizado consegue criar e atualizar a negociação do lead

### `FRONT-11` - Implementar histórico e timeline da negociação

- Objetivo: tornar visível a evolução comercial.
- Labels: `frontend`, `negotiations`
- Checklist:
- criar componente de timeline
- integrar histórico de mudanças de estágio e status
- ordenar eventos por data e hora
- mostrar autor e contexto do evento quando disponível
- Aceite:
- o detalhe do lead permite ler a evolução da negociação com clareza

### `FRONT-12` - Implementar dashboard operacional

- Objetivo: cobrir `RF04`.
- Labels: `frontend`, `dashboard`
- Checklist:
- montar layout do dashboard operacional
- integrar KPIs de total de leads
- integrar gráficos por status, origem, loja e importância
- aplicar filtro padrão de 30 dias
- tratar troca de período sem quebrar a navegação
- Aceite:
- gerente, gerente geral e admin conseguem consultar o dashboard operacional

### `FRONT-13` - Implementar dashboard analítico

- Objetivo: cobrir `RF05` e parte visual de `RF06`.
- Labels: `frontend`, `dashboard`
- Checklist:
- montar layout do dashboard analítico
- integrar conversão, comparativos, equipe, atendente, importância e motivos
- integrar tempo médio até atendimento
- tratar semana, mês, ano e período customizado
- mostrar erro orientado quando a API rejeitar intervalo inválido
- Aceite:
- dashboards analíticos funcionam com filtros temporais coerentes com o papel

### `FRONT-14` - Implementar equipes e vínculos

- Objetivo: cobrir a parte visual e operacional de equipes.
- Labels: `frontend`, `admin`
- Checklist:
- criar tela de equipes
- listar gerente e atendentes vinculados
- permitir ação de vínculo quando o papel permitir
- refletir estados de permissão na UI
- Aceite:
- gerente e admin conseguem operar vínculos conforme contrato final

### `FRONT-15` - Implementar gestão administrativa de usuários

- Objetivo: cobrir a frente administrativa principal do frontend.
- Labels: `frontend`, `admin`
- Checklist:
- criar listagem de utilizadores
- suportar criação, edição e exclusão quando permitido
- exibir papel, estado e vínculo com equipa
- tratar feedback de operação
- Aceite:
- administrador consegue operar utilizadores via frontend

### `FRONT-16` - Implementar gestão de lojas

- Objetivo: completar a estrutura organizacional mínima no frontend.
- Labels: `frontend`, `admin`
- Checklist:
- criar listagem de lojas
- suportar criação, edição e exclusão
- integrar estados vazios e erro
- Aceite:
- administrador consegue operar lojas via frontend

### `FRONT-17` - Implementar logs administrativos

- Objetivo: cobrir `RF07` na interface.
- Labels: `frontend`, `admin`
- Checklist:
- criar listagem de logs
- suportar filtros por utilizador, entidade e data
- exibir detalhe de evento
- tratar paginação ou carregamento incremental
- Aceite:
- administrador consegue consultar logs de acesso e operação com legibilidade

### `FRONT-18` - Consolidar responsividade, estados e RBAC visual

- Objetivo: fechar a camada de acabamento funcional.
- Labels: `frontend`
- Checklist:
- revisar responsividade de login, shell, leads e dashboards
- garantir `empty states`, `error states` e `403` nas telas principais
- revisar botões ocultos ou desabilitados por papel
- remover inconsistências visuais entre features
- Aceite:
- o sistema mantém coerência de UX e permissão visual nas áreas principais

## Dependências externas que podem bloquear cartões

- contratos de backend ainda não fechados;
- definição final de status e estágios de negociação;
- retorno real das consultas de dashboard;
- política de sessão e armazenamento do JWT no frontend;
- decisão final sobre granularidade do `Gerente Geral`.

## Definition of Done específico para cartões de frontend

- rota ou componente principal entregue;
- integração HTTP funcional ou mock tipado temporário claramente sinalizado;
- estados de `loading`, `empty`, `error` e `403` tratados quando aplicável;
- textos da interface consistentes com o domínio;
- responsividade mínima validada;
- documentação atualizada se o fluxo mudou.
