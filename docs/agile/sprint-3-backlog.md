# Sprint 3 Backlog

## Objetivo

Registrar o backlog operacional da Sprint 3 em nível de épicos fullstack `end-to-end`, conectando cada card ao feedback do parceiro, aos requisitos da ABP e ao tipo de entrega esperada.

## Princípio de organização

Na Sprint 3, os cards do board representam frentes de padronização UX ou fechamento funcional remanescente. Cada épico abaixo deve virar um card principal no Trello, com checklist interno de implementação.

## Backlog da sprint

## `S3-EPIC-01` - Design system e componentes compartilhados

### Objetivo

Estabelecer fundação visual única para toda a Sprint 3: tokens CSS, `KpiCard`, utilitários de cor de gráficos, paginação padrão e padrão zebra em tabelas.

### Estado atual da `main`

- `--brand-accent` definido em `front/src/app/styles.css`;
- dashboards usam hex soltos (`#ff4f1f`, `#ff5722`, `#f05a28`);
- KPIs implementados inline por página, sem componente compartilhado;
- paginação heterogênea entre módulos (6, 8, 10, fixo vs configurável).

### Requisitos relacionados

- `RNF04`
- `RF04`
- `RF05`

### Saída esperada

- tokens pastel documentados em [`sprint-3-design-system.md`](./sprint-3-design-system.md);
- `KpiCard` reutilizável;
- `TablePagination` reutilizável;
- utilitários `chart-colors` (barra única, performance loja, brand source);
- token `--table-row-alt` para zebra;
- remoção gradual de hex hardcoded nas telas da sprint.

### Prioridade

P0 — bloqueante

---

## `S3-EPIC-02` - Dashboard operacional — UX, período mensal, cores

### Objetivo

Atender feedback do parceiro em KPIs pastel, padronização de cores de gráficos e filtro temporal com seletor de mês explícito (removendo “últimos 30 dias”).

### Estado atual da `main`

- preset `last30` como default;
- barras multicoloridas por status;
- KPIs com gradientes vibrantes por card.

### Requisitos relacionados

- `RF04`
- `RF06`
- `RNF04`

### Saída esperada

- KPIs via `KpiCard` com baixa saturação;
- leads por status: cor única ou escala laranja;
- leads por loja: vermelho/verde por meta (&lt;25% vs ≥25%);
- leads por origem: brand colors para plataformas conhecidas;
- remover preset `last30`; mês com seletor `YYYY-MM`;
- backend aceita mês explícito quando necessário.

### Prioridade

P0

### Dependências

- `S3-EPIC-01`

---

## `S3-EPIC-03` - Dashboard analítico — UX, modais, filtros

### Objetivo

Padronizar cores, remover botão “Filtros” decorativo e implementar modais “ver detalhes” com drill-down simplificado e link para gestão de leads.

### Requisitos relacionados

- `RF05`
- `RF06`
- `RNF04`

### Saída esperada

- KPIs e charts alinhados ao design system;
- remoção do botão “Filtros” sem função;
- modal importância: leads + classificação + navegação;
- modal conversão: resumo convertidos/perdidos + atalhos;
- filtros temporais semana/mês/ano/custom preservados.

### Prioridade

P0

### Dependências

- `S3-EPIC-01`

---

## `S3-EPIC-04` - Clientes — KPIs, tabela, paginação, gráficos

### Objetivo

Revisar valor dos KPIs, aplicar zebra na tabela, paginação default 5 (step 5), realocar ou remover gráficos da página.

### Requisitos relacionados

- `RF02`
- `RNF04`

### Saída esperada

- decisão documentada sobre KPIs total vs ativos;
- tabela com linhas alternadas;
- paginação `5, 10, 15, 20…`;
- gráficos removidos ou movidos para dashboards;
- cores alinhadas ao design system.

### Prioridade

P1

### Dependências

- `S3-EPIC-01`
- `S3-EPIC-02` / `S3-EPIC-03` (se gráficos forem realocados)

---

## `S3-EPIC-05` - Gestão de leads — KPIs, filtros, modais, remoção de gráficos

### Objetivo

Focar a tela em operação diária: KPIs úteis, filtro padrão trabalhável, modal de detalhe na listagem, remoção de gráficos e ruído do header.

### Requisitos relacionados

- `RF02`
- `RF04`
- `RNF04`

### Saída esperada

- revisão de KPIs (remover redundâncias);
- remover `FunnelCard` e `OriginsCard` da listagem;
- filtro padrão: status trabalháveis (abertos, qualificados, em negociação);
- detalhe do lead: bloco “Produto de interesse” em vez de redundância com cliente;
- remover Importar e atalho Filtros do header;
- “Ver detalhe” da lista via modal com link opcional para página completa.

### Prioridade

P0

### Dependências

- `S3-EPIC-01`

---

## `S3-EPIC-06` - Negociações — KPIs + Agenda interna

### Objetivo

Colorir KPIs com tokens, remover fallbacks mock de métricas e adicionar agenda interna do CRM por usuário, sem dependência de API externa.

### Requisitos relacionados

- `RF03`
- `RNF04`
- agenda interna por usuário autenticado

### Saída esperada

- KPIs via `KpiCard`;
- remoção de valores hardcoded em `negotiations-metrics.ts`;
- módulo backend `agenda` com persistência por usuário;
- endpoint `GET /agenda/items`;
- rota `/app/agenda` com calendário mensal;
- UI substituindo `IMPORTANT_ACTIVITIES_MOCK` por dados reais da agenda;
- estados loading/erro/vazio/criação/conclusão/cancelamento.

### Prioridade

P1

### Dependências

- `S3-EPIC-01`

---

## `S3-EPIC-07` - Veículos — paginação padronizada

### Objetivo

Alinhar paginação de veículos ao padrão `TablePagination` com seletor de itens por página.

### Requisitos relacionados

- `RNF04`

### Saída esperada

- seletor de page size configurável;
- padrão visual igual demais listagens administrativas.

### Prioridade

P2

### Dependências

- `S3-EPIC-01`

---

## `S3-EPIC-08` - Lojas — layout, CRUD estendido persistido, paginação

### Objetivo

Inverter layout (lista acima, gráficos abaixo), remover export do header, paginação configurável e persistir campos completos de loja no banco.

### Estado atual da `main`

- `Store` no Prisma só possui `name`;
- cidade/região/endereço são mock no frontend (`store-catalog-view.ts`);
- update API aceita apenas `name`.

### Requisitos relacionados

- `RF02`
- `RNF05`
- `RNF04`

### Saída esperada

- migration: `city`, `state`, `region`, `addressLine`, `ownerName`, etc.;
- DTOs, validators e use cases atualizados;
- formulário de edição completo no frontend;
- layout invertido;
- export removido do canto superior;
- paginação padronizada.

### Prioridade

P1

### Dependências

- `S3-EPIC-01`

---

## `S3-EPIC-09` - Equipes — modal membros, atribuição, cores neutras

### Objetivo

Substituir ícones de membros por modal detalhado, permitir atribuição/remoção na edição (mesma loja) e neutralizar cores da distribuição por loja.

### Requisitos relacionados

- `RF02`
- `RNF04`

### Saída esperada

- modal membros: foto, nome, função, e-mail;
- edição com multi-select de membros elegíveis;
- remover texto disclaimer do formulário;
- gráfico distribuição monocromático.

### Prioridade

P1

### Dependências

- `S3-EPIC-01`

---

## `S3-EPIC-10` - Usuários — refactor UI + multi-grupo + edição completa

### Objetivo

Refatorar página de usuários para alinhar ao shell CRM, permitir edição completa e múltiplos grupos sem herança hierárquica implícita de permissões.

### Estado atual da `main`

- `User.accessGroupId` único no schema;
- filtros client-side na página atual;
- UI desalinhada do restante do sistema.

### Requisitos relacionados

- `RF01`
- `RF02`
- `RNF02`
- `RNF04`

### Saída esperada

- junction `UserAccessGroup` (ou equivalente);
- agregação de `featureKeys` por união explícita;
- formulário: nome, e-mail, papel, grupos, equipe, senha opcional;
- refactor visual completo mantendo features existentes;
- filtros server-side ou paginação coerente.

### Prioridade

P1

### Dependências

- `S3-EPIC-01`

---

## `S3-EPIC-11` - Audit log completo (back + front + cobertura de eventos)

### Objetivo

Fechar `RF07` com consulta administrativa, cobertura ampla de eventos e tela de auditoria no frontend.

### Estado atual da `main`

- tabela `AuditLog` e helper `createAuditLogEntry` existem;
- emissão parcial (ex.: deals);
- módulo `audit-logs` só com domain;
- sem rota frontend.

### Requisitos relacionados

- `RF07`
- `RF02`
- `RNF02`
- `RNF05`

### Saída esperada

- API paginada com filtros (data, entidade, ação, ator);
- instrumentação: login, CRUD clientes/users/teams/leads/deals;
- rota `/app/audit-logs` (admin);
- tabela zebra + filtros + paginação padrão;
- contrato OpenAPI documentado.

### Prioridade

P0

---

## Ordem sugerida de execução

1. `S3-EPIC-01`
2. `S3-EPIC-11`, `S3-EPIC-02`, `S3-EPIC-03`, `S3-EPIC-05`
3. `S3-EPIC-04`, `S3-EPIC-06`, `S3-EPIC-08`, `S3-EPIC-09`, `S3-EPIC-10`
4. `S3-EPIC-07`

## Leitura de prioridade

- `S3-EPIC-01` desbloqueia toda refatoração visual;
- `S3-EPIC-11` fecha requisito explícito de banca (`RF07`);
- `S3-EPIC-02` e `S3-EPIC-03` respondem diretamente ao feedback mais visível do parceiro;
- `S3-EPIC-05` melhora operação diária de atendentes;
- `S3-EPIC-08` e `S3-EPIC-10` exigem mudanças de schema e maior cuidado com RBAC;
- `S3-EPIC-07` é alinhamento fino de baixo risco.
