# Sprint 3 — Cards mapeados para Trello

## Objetivo

Mapear cada épico da Sprint 3 para cards do board Trello, com título, descrição, labels, dependências e checklist operacional.

## Contexto

- **Board ID:** `69c703d96be11af4c1d82c07`
- **Lista sugerida:** `Sprint 3` (criar se não existir)
- **Documentação:** [`sprint-3-backlog.md`](./sprint-3-backlog.md), [`sprint-3-task-breakdown.md`](./sprint-3-task-breakdown.md), [`sprint-3-client-feedback-spec.md`](./sprint-3-client-feedback-spec.md)

## Labels sugeridas

| Label | Cor Trello | Uso |
| --- | --- | --- |
| `sprint-3` | blue | Todos os cards |
| `fullstack` | green | Épicos E2E |
| `ux` | yellow | Refino visual/UX |
| `design-system` | purple | EPIC-01 |
| `backend` | orange | Trabalho API/domínio |
| `frontend` | sky | Trabalho UI |
| `rf04` | lime | Dashboard operacional |
| `rf05` | lime | Dashboard analítico |
| `rf07` | red | Audit log |
| `integracao` | pink | Google Calendar |
| `breaking-schema` | black | Migrations Store/User |

---

## Ordem de criação no board

1. `S3-EPIC-01`
2. `S3-EPIC-11`, `S3-EPIC-02`, `S3-EPIC-03`, `S3-EPIC-05`
3. `S3-EPIC-04`, `S3-EPIC-06`, `S3-EPIC-08`, `S3-EPIC-09`, `S3-EPIC-10`
4. `S3-EPIC-07`

---

## Card 1 — `[S3-EPIC-01] Design system e componentes compartilhados`

**Labels:** `sprint-3`, `fullstack`, `ux`, `design-system`, `frontend`

**Descrição:**

Estabelecer fundação visual da Sprint 3: tokens CSS pastel, `KpiCard`, `TablePagination`, utilitários de cor de gráficos e padrão zebra.

**Docs:** [`sprint-3-design-system.md`](./sprint-3-design-system.md)

**Dependências:** nenhuma (bloqueante)

**Checklist:**

- [ ] Documentar tokens em sprint-3-design-system.md
- [ ] Expandir `:root` em styles.css
- [ ] Criar KpiCard.tsx
- [ ] Criar TablePagination.tsx
- [ ] Criar chart-colors.ts
- [ ] Validar contraste acessível
- [ ] Publicar guia de migração hex → tokens

---

## Card 2 — `[S3-EPIC-02] Dashboard operacional — UX, período mensal, cores`

**Labels:** `sprint-3`, `fullstack`, `ux`, `rf04`, `frontend`, `backend`

**Descrição:**

KPIs pastel, padronização de gráficos, remover last30, seletor de mês YYYY-MM.

**Docs:** `S3-DOP-*` em [`sprint-3-client-feedback-spec.md`](./sprint-3-client-feedback-spec.md)

**Dependências:** EPIC-01

**Checklist:**

- [ ] Migrar KPIs para KpiCard
- [ ] Barras status cor única
- [ ] Barras loja vermelho/verde por 25%
- [ ] Origem brand colors
- [ ] Remover preset last30
- [ ] Seletor mês YYYY-MM
- [ ] Ajustar backend período se necessário
- [ ] Atualizar dashboard-operational-contract.md

---

## Card 3 — `[S3-EPIC-03] Dashboard analítico — UX, modais, filtros`

**Labels:** `sprint-3`, `fullstack`, `ux`, `rf05`, `frontend`

**Descrição:**

Padronizar cores, remover botão Filtros decorativo, modais ver detalhes com drill-down.

**Dependências:** EPIC-01

**Checklist:**

- [ ] KPIs via KpiCard
- [ ] Paleta charts design system
- [ ] Remover botão Filtros
- [ ] Modal importância
- [ ] Modal conversão
- [ ] Links para /app/leads/[id]
- [ ] Atualizar dashboard-analytic-contract.md

---

## Card 4 — `[S3-EPIC-04] Clientes — KPIs, tabela, paginação, gráficos`

**Labels:** `sprint-3`, `fullstack`, `ux`, `frontend`, `backend`

**Descrição:**

Revisar KPIs, zebra, paginação 5/step5, remover/mover gráficos.

**Dependências:** EPIC-01

**Checklist:**

- [ ] Decisão KPIs (spec)
- [ ] KpiCard nos KPIs mantidos
- [ ] Zebra tabela
- [ ] Paginação 5,10,15…
- [ ] Remover gráficos da página
- [ ] Tokens de cor

---

## Card 5 — `[S3-EPIC-05] Gestão de leads — KPIs, filtros, modais`

**Labels:** `sprint-3`, `fullstack`, `ux`, `frontend`, `backend`

**Descrição:**

Foco operacional: KPIs úteis, filtro trabalhável, modal detalhe, sem gráficos na listagem.

**Dependências:** EPIC-01

**Checklist:**

- [ ] Revisar KPIs
- [ ] Remover FunnelCard/OriginsCard
- [ ] Filtro padrão trabalhável
- [ ] Produto de interesse no detalhe
- [ ] Remover Importar/Filtros header
- [ ] Modal ver detalhe na lista
- [ ] KpiCard + tokens

---

## Card 6 — `[S3-EPIC-06] Negociações — KPIs + Google Calendar (read)`

**Labels:** `sprint-3`, `fullstack`, `ux`, `integracao`, `backend`, `frontend`

**Descrição:**

KPIs coloridos, remover mocks, OAuth Google Calendar leitura em atividades importantes.

**Dependências:** EPIC-01

**Checklist:**

- [ ] KpiCard métricas
- [ ] Remover fallbacks mock
- [ ] Módulo OAuth backend
- [ ] Persistir tokens usuário
- [ ] GET events endpoint
- [ ] UI ImportantActivitiesCard
- [ ] Runbook env vars

---

## Card 7 — `[S3-EPIC-07] Veículos — paginação padronizada`

**Labels:** `sprint-3`, `ux`, `frontend`

**Descrição:**

TablePagination com seletor de itens por página.

**Dependências:** EPIC-01

**Checklist:**

- [ ] Integrar TablePagination
- [ ] Page size options
- [ ] Tokens onde aplicável

---

## Card 8 — `[S3-EPIC-08] Lojas — layout, CRUD persistido, paginação`

**Labels:** `sprint-3`, `fullstack`, `breaking-schema`, `backend`, `frontend`

**Descrição:**

Migration Store, formulário completo, layout invertido, sem export header.

**Dependências:** EPIC-01

**Checklist:**

- [ ] Migration campos Store
- [ ] API update/create estendida
- [ ] Remover mock catalog-view
- [ ] Form edição completo
- [ ] Layout lista acima / gráficos abaixo
- [ ] Remover export
- [ ] TablePagination

---

## Card 9 — `[S3-EPIC-09] Equipes — modal membros, atribuição`

**Labels:** `sprint-3`, `fullstack`, `ux`, `backend`, `frontend`

**Descrição:**

Modal membros, edição com atribuição, distribuição monocromática.

**Dependências:** EPIC-01

**Checklist:**

- [ ] Modal membros
- [ ] Edição atribuir/remover membros
- [ ] Remover disclaimer
- [ ] Gráfico neutro
- [ ] Tokens

---

## Card 10 — `[S3-EPIC-10] Usuários — refactor UI + multi-grupo`

**Labels:** `sprint-3`, `fullstack`, `breaking-schema`, `backend`, `frontend`

**Descrição:**

Refactor página, edição completa, múltiplos grupos sem herança hierárquica.

**Dependências:** EPIC-01

**Checklist:**

- [ ] ADR multi-grupo
- [ ] Migration UserAccessGroup
- [ ] Autorização união features
- [ ] Refactor UsersManagementScreen
- [ ] Form edição completo
- [ ] Filtros server-side
- [ ] Testes permissão

---

## Card 11 — `[S3-EPIC-11] Audit log completo (RF07)`

**Labels:** `sprint-3`, `fullstack`, `rf07`, `backend`, `frontend`

**Descrição:**

API consulta, cobertura eventos, UI admin /app/audit-logs.

**Dependências:** nenhuma (paralelo após EPIC-01 para UI)

**Checklist:**

- [ ] Matriz eventos
- [ ] Repositório + use case listagem
- [ ] Controller + filtros
- [ ] Instrumentar CRUDs + login
- [ ] Rota frontend admin
- [ ] Tabela zebra + paginação
- [ ] OpenAPI + docs/api

---

## Script de criação (referência)

Após aprovação, cards são criados via Trello REST API:

```bash
# Exemplo — criar card (substituir idList)
curl -s -X POST "https://api.trello.com/1/cards?key=$TRELLO_KEY&token=$TRELLO_TOKEN" \
  -d "idList={LIST_ID}" \
  -d "name=[S3-EPIC-01] Design system e componentes compartilhados" \
  -d "desc=..." \
  -d "idLabels={LABEL_IDS}"
```

Checklists são adicionadas via `POST /1/cards/{id}/checkItems`.

## Próximos passos

1. Criar lista `Sprint 3` no board se ausente.
2. Criar labels ausentes.
3. Criar cards na ordem definida.
4. Anexar link para este repositório na descrição de cada card.
