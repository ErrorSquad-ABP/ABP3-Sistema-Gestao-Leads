# Sprint 3 Task Breakdown

## Objetivo

Transformar os épicos da Sprint 3 em checklists operacionais prontos para Trello, mantendo o modelo `1 card = 1 feature end-to-end`.

## Regra da sprint

Cada card da Sprint 3 deve conter checklist suficiente para o responsável levar a feature até um incremento utilizável, sem quebrar o trabalho em vários cards por camada.

## Estrutura padrão de checklist por épico

Cada card principal deve incluir, no mínimo, os blocos abaixo:

1. refinar regras de negócio e critérios de aceite;
2. ajustar ou criar modelagem/persistência quando necessário;
3. implementar contratos e casos de uso no backend;
4. implementar interface e fluxo no frontend;
5. garantir `RBAC`, escopo e validação sensível no backend;
6. atualizar documentação impactada;
7. validar qualidade, fluxo local e demonstração mínima.

## Checklists por card

## `S3-EPIC-01` - Design system e componentes compartilhados

- documentar tokens em [`sprint-3-design-system.md`](./sprint-3-design-system.md);
- expandir `:root` em `front/src/app/styles.css` (pastel, chart, table);
- criar `front/src/components/metrics/KpiCard.tsx`;
- criar `front/src/components/data/TablePagination.tsx`;
- criar `front/src/lib/charts/chart-colors.ts` (bar, store performance, source brand);
- definir variantes KPI: `brand`, `success`, `warning`, `neutral`, `danger-soft`;
- validar contraste acessível (texto + ícone, não só cor);
- publicar guia de migração para remover hex soltos.

## `S3-EPIC-02` - Dashboard operacional

- migrar KPIs para `KpiCard`;
- aplicar regras de cor em status (barra única/laranja);
- aplicar regra performance loja (&lt;25% vermelho suave, ≥25% verde suave);
- aplicar `SOURCE_BRAND_COLORS` + default neutro em origem;
- manter importância como está (aprovado);
- remover preset `last30` da UI e docs;
- adicionar seletor `YYYY-MM` no modo mês;
- ajustar `operational-dashboard-period.ts` e use case se necessário;
- validar estados loading/vazio/erro;
- atualizar [`docs/api/dashboard-operational-contract.md`](../api/dashboard-operational-contract.md).

## `S3-EPIC-03` - Dashboard analítico

- migrar KPIs para `KpiCard`;
- substituir `TEAM_COLORS` rainbow por paleta design system;
- remover botão “Filtros” decorativo;
- implementar modal “Ver detalhes da importância”;
- implementar modal “Ver detalhes da conversão”;
- links de lead para `/app/leads/[id]`;
- validar filtros temporais existentes;
- atualizar [`docs/api/dashboard-analytic-contract.md`](../api/dashboard-analytic-contract.md).

## `S3-EPIC-04` - Clientes

- workshop/decisão KPIs total vs ativos (registrar no spec);
- aplicar `KpiCard` nos KPIs mantidos;
- zebra rows na tabela;
- paginação default 5, step 5;
- auditar gráficos: remover ou mover para dashboards;
- aplicar tokens de cor;
- validar catálogo paginado no backend.

## `S3-EPIC-05` - Gestão de leads

- revisar KPIs e remover redundâncias;
- remover sidebar com `FunnelCard` e `OriginsCard`;
- definir filtro padrão status trabalháveis;
- renomear/reorganizar bloco detalhe → produto de interesse;
- remover Importar e atalho Filtros do header;
- implementar modal detalhe na listagem;
- aplicar `KpiCard` e tokens;
- validar fluxo atendente vs gestor.

## `S3-EPIC-06` - Negociações + Google Calendar

- migrar métricas para `KpiCard`;
- remover fallbacks mock em `negotiations-metrics.ts`;
- criar módulo backend Google Calendar OAuth;
- persistir tokens por usuário;
- endpoint listagem eventos próximos;
- substituir mock em `ImportantActivitiesCard`;
- UI conectar/desconectar conta Google;
- documentar env vars e runbook;
- harmonizar cores pipeline com tokens.

## `S3-EPIC-07` - Veículos

- integrar `TablePagination`;
- definir page size options alinhadas ao padrão;
- validar catálogo cards/table;
- aplicar tokens onde houver hex solto.

## `S3-EPIC-08` - Lojas

- criar migration campos `Store`;
- atualizar entidade, DTOs, validators, use cases;
- remover mock de endereço no `store-catalog-view.ts`;
- formulário edição completo;
- inverter ordem lista/gráficos na tela;
- remover export do header;
- paginação configurável;
- seed/migration backward-compatible;
- documentar contrato API stores.

## `S3-EPIC-09` - Equipes

- modal membros com foto, nome, função, e-mail;
- edição: atribuir/remover membros (mesma loja);
- remover disclaimer do form;
- distribuição por loja monocromática;
- aplicar tokens e zebra se houver tabela;
- validar RBAC de gestão de equipes.

## `S3-EPIC-10` - Usuários

- ADR multi-grupo vs hierarquia;
- migration junction `UserAccessGroup`;
- atualizar serviço de autorização (união de features);
- refactor `UsersManagementScreen` alinhado ao shell;
- formulário edição completo;
- filtros coerentes com paginação server-side;
- testes de permissão sem herança implícita;
- documentar breaking change se houver.

## `S3-EPIC-11` - Audit log completo

- fechar matriz evento × módulo;
- implementar repositório Prisma + use case listagem;
- controller paginado + filtros;
- instrumentar login e CRUDs críticos;
- rota frontend `/app/audit-logs`;
- tabela zebra + filtros + paginação;
- restringir a admin;
- contrato OpenAPI + `docs/api/`;
- testes de integração mínimos.

## Critério mínimo de encerramento por card

Um card só pode ir para `Done` quando:

- backend e frontend da feature estiverem utilizáveis (quando aplicável);
- quality gate passar;
- documentação impactada estiver atualizada;
- critérios de [`sprint-3-client-feedback-spec.md`](./sprint-3-client-feedback-spec.md) atendidos para o escopo do épico;
- o responsável conseguir demonstrar a feature ponta a ponta.
