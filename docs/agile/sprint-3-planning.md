# Sprint 3 Planning

## Objetivo

Documentar o planejamento da Sprint 3 com base no feedback do parceiro comercial, na retrospective da Sprint 2 e no estado real da `main`, definindo escopo comprometido, forma de execução e critérios de sucesso.

## Contexto

A Sprint 3 acontece de `22/05/2026` a `11/06/2026`. O produto já possui núcleo transacional, dashboards, negociações e veículos entregues na Sprint 2. O foco deste ciclo **não** é abrir blocos funcionais grandes, e sim:

- padronização visual e conforto cromático;
- UX operacional (filtros padrão, modais, remoção de ruído);
- KPIs com valor de negócio;
- audit log completo (`RF07`);
- agenda interna por usuário;
- evolução de cadastros administrativos (lojas, equipes, usuários).

A retrospective da Sprint 2 registrou que a auditoria ficou com base técnica encaminhada, mas sem cobertura ampla nem experiência administrativa final.

## Direção adotada

- cada card principal da sprint representa uma feature ou frente transversal `end-to-end`;
- o responsável do card assume backend, frontend, contrato, QA e documentação impactada quando aplicável;
- **`S3-EPIC-01` (design system) é bloqueante** para refatorações visuais das demais telas;
- a sprint prioriza consistência percebida pelo parceiro sobre novas funcionalidades;
- o backlog não será quebrado em “card de backend” e “card de frontend” para a mesma feature.

## Meta da sprint

Consolidar padronização UX, KPIs úteis, simplicidade visual, audit log completo e ajustes administrativos solicitados pelo cliente, preservando a base entregue na Sprint 2.

## Escopo comprometido

### Épicos priorizados

- `S3-EPIC-01` Design system e componentes compartilhados
- `S3-EPIC-02` Dashboard operacional — UX, período mensal, cores
- `S3-EPIC-03` Dashboard analítico — UX, modais, filtros
- `S3-EPIC-04` Clientes — KPIs, tabela, paginação, gráficos
- `S3-EPIC-05` Gestão de leads — KPIs, filtros, modais, remoção de gráficos
- `S3-EPIC-06` Negociações — KPIs + Agenda interna
- `S3-EPIC-07` Veículos — paginação padronizada
- `S3-EPIC-08` Lojas — layout, CRUD estendido persistido, paginação
- `S3-EPIC-09` Equipes — modal membros, atribuição, cores neutras
- `S3-EPIC-10` Usuários — refactor UI + multi-grupo + edição completa
- `S3-EPIC-11` Audit log completo (back + front + cobertura de eventos)

### Documentação de apoio

- [`sprint-3-design-system.md`](./sprint-3-design-system.md) — paleta, KPIs, gráficos, paginação
- [`sprint-3-client-feedback-spec.md`](./sprint-3-client-feedback-spec.md) — tradução técnica do feedback
- [`sprint-3-trello-cards.md`](./sprint-3-trello-cards.md) — mapeamento para o board

## Fora de escopo nesta sprint

- recuperação de senha por e-mail;
- cadastro público de conta;
- polimento final de apresentação de banca;
- integrações externas de calendário;
- gestão completa de estoque;
- expansões não pedidas pelo parceiro ou pelo edital fora do recorte acima.

## Origem do escopo (feedback do cliente)

O escopo foi consolidado a partir de revisão conjunta com o parceiro, cobrindo:

- dashboards operacional e analítico (cores, filtros, modais);
- clientes, leads, negociações, veículos, lojas, equipes e usuários;
- audit log completo;
- princípio transversal: **padronização, simplicidade e conforto visual**.

Detalhamento item a item: [`sprint-3-client-feedback-spec.md`](./sprint-3-client-feedback-spec.md).

## Modelo de execução da sprint

### Regra dos cards

- `1 card = 1 épico`
- o card não é repassado entre pessoas por camada;
- o dono da feature leva até o incremento utilizável;
- checklist interno do card representa subtarefas e critérios de aceite.

### Responsabilidade mínima por card

Cada épico deve considerar, no mínimo:

- regra de negócio e domínio (quando houver alteração);
- API/backend (quando houver alteração);
- interface/frontend;
- `RBAC` e validação sensível no backend;
- documentação de contrato impactada;
- validação local e critérios de aceite.

## Dependências críticas

1. `S3-EPIC-01` destrava refatoração visual das demais telas.
2. Dashboards (`S3-EPIC-02`, `S3-EPIC-03`) absorvem gráficos removidos de leads/clientes.
3. `S3-EPIC-08` (lojas) exige migration de schema — coordenar com ambiente compartilhado.
4. `S3-EPIC-10` (multi-grupo) impacta autorização — exige ADR e testes de permissão.
5. `S3-EPIC-11` (audit log) é transversal e deve ser planejado por evento/módulo.
6. `S3-EPIC-06` depende de migration de agenda interna em ambiente de dev/produção.

## Riscos e atenção

- amplitude de 11 épicos em ~3 semanas exige priorização rigorosa (`S3-EPIC-07` como P2);
- multi-grupo pode quebrar suposições atuais de `accessGroupId` único no `User`;
- migration de `Store` em base compartilhada deve ser backward-compatible;
- agenda interna exige validação de escopo por usuário e migration aplicada;
- remover KPIs exige validação com PO antes de cortar indicadores.

## Ordem sugerida de execução

1. `S3-EPIC-01`
2. `S3-EPIC-11`, `S3-EPIC-02`, `S3-EPIC-03`, `S3-EPIC-05` (paralelo após EPIC-01)
3. `S3-EPIC-04`, `S3-EPIC-06`, `S3-EPIC-08`, `S3-EPIC-09`, `S3-EPIC-10`
4. `S3-EPIC-07`

## Critérios de sucesso da sprint

- parceiro consegue navegar o sistema sem desconforto visual por cores vibrantes;
- dashboards e listagens compartilham a mesma linguagem visual;
- telas operacionais focadas em trabalho diário (tabela + ação);
- audit log demonstrável para administrador;
- lojas editáveis com dados persistidos;
- cards Trello da Sprint 3 refletem o breakdown documentado;
- documentação ágil e IHC atualizadas.
