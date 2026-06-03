# Sprint 3 — Especificação técnica do feedback do cliente

## Objetivo

Traduzir o feedback do parceiro comercial (1000 Valle Multimarcas) em requisitos técnicos rastreáveis, com critérios de aceite e arquivos alvo, para execução na Sprint 3.

## Contexto

Este documento complementa [`sprint-3-backlog.md`](./sprint-3-backlog.md) e [`sprint-3-design-system.md`](./sprint-3-design-system.md). Itens marcados como **transversal** aplicam-se a todos os épicos mesmo quando não repetidos por seção.

## Direção adotada

- palavra-chave da sprint: **simplicidade**;
- padronização > novas features;
- modais para consulta rápida; páginas completas apenas quando o fluxo exige edição extensa;
- backend como fonte de verdade para permissões, filtros temporais e persistência.

---

## Requisitos transversais

| ID | Feedback (cliente) | Aceite técnico | Arquivos / épicos |
| --- | --- | --- | --- |
| `S3-UX-01` | Cores pastel, menos choque visual | Tokens em `styles.css`; remover hex soltos | EPIC-01, todos |
| `S3-UX-02` | KPIs coloridos mesma intensidade | `KpiCard` + variants | EPIC-01, 02–10 |
| `S3-UX-03` | Paginação padronizada | `TablePagination` | EPIC-01, 04, 07, 08, 11 |
| `S3-UX-04` | Linhas alternadas em tabelas | Zebra `--table-row-alt` | EPIC-04, 08, 09, 10, 11 |
| `S3-UX-05` | KPIs com valor real | Matriz design system + corte PO | EPIC-04, 05, todos KPI |

---

## Dashboard Operacional

**Épico:** `S3-EPIC-02`  
**Arquivos principais:**  
- `front/src/features/dashboard-operational/components/operational-dashboard-page-content.tsx`  
- `front/src/features/dashboard-operational/lib/operational-dashboard-period.ts`  
- `back/src/modules/dashboards/application/use-cases/get-operational-dashboard.use-case.ts`

| ID | Feedback | Aceite | Status alvo |
| --- | --- | --- | --- |
| `S3-DOP-01` | KPIs menos vibrantes | `KpiCard` variant brand/neutral | Done c/ EPIC-02 |
| `S3-DOP-02` | Leads por status: cor única | Remover mapa multicolor; `--chart-bar-default` | Done c/ EPIC-02 |
| `S3-DOP-03` | Leads por loja: vermelho/verde por meta | `storeBarColor(share, 0.25)` | Done c/ EPIC-02 |
| `S3-DOP-04` | Leads por origem: brand conhecidas | `SOURCE_BRAND_COLORS` + default | Done c/ EPIC-02 |
| `S3-DOP-05` | Importância OK | Sem alteração funcional | N/A |
| `S3-DOP-06` | Remover “últimos 30 dias”; mês selecionável | Remover `last30`; input `type="month"` | Done c/ EPIC-02 |
| `S3-DOP-07` | Consistência entre gráficos | Usar `chart-colors.ts` | Done c/ EPIC-02 |

---

## Dashboard Analítico

**Épico:** `S3-EPIC-03`  
**Arquivo principal:** `front/src/features/dashboard-analytic/components/analytic-dashboard-page-content.tsx`

| ID | Feedback | Aceite | Status alvo |
| --- | --- | --- | --- |
| `S3-DAN-01` | KPIs como operacional | `KpiCard` | Done c/ EPIC-03 |
| `S3-DAN-02` | Padronizar cores charts | Paleta design system | Done c/ EPIC-03 |
| `S3-DAN-03` | Remover filtros canto superior | Remover botão linhas 764–771 | Done c/ EPIC-03 |
| `S3-DAN-04` | “Ver detalhes” → modal | Modais importância + conversão | Done c/ EPIC-03 |
| `S3-DAN-05` | Modal leva ao lead | Link `/app/leads/[id]` | Done c/ EPIC-03 |
| `S3-DAN-06` | Filtros temporais | Manter semana/mês/ano/custom | Preservar |

---

## Clientes

**Épico:** `S3-EPIC-04`  
**Arquivos:** `CustomersManagementScreen.tsx`, `CustomersTable.tsx`

| ID | Feedback | Aceite | Decisão proposta |
| --- | --- | --- | --- |
| `S3-CLI-01` | Revisar KPIs total vs ativos | Documentar + implementar | **Manter:** total, com negociações, ativos. **Remover:** taxa retenção (baixo valor operacional). |
| `S3-CLI-02` | Zebra tabela | `--table-row-alt` | Implementar |
| `S3-CLI-03` | Gráficos: necessidade | Remover da página; dados nos dashboards | Mover lógica para EPIC-02/03 se faltar widget |
| `S3-CLI-04` | Paginação 5 default, step 5 | `[5,10,15,20,25,30]` | Implementar |
| `S3-CLI-05` | Cores padronizadas | Tokens | Implementar |

---

## Gestão de Leads

**Épico:** `S3-EPIC-05`  
**Arquivos:** `leads-page-content.tsx`, `LeadsCatalogWidgets.tsx`, `LeadDetailPageContent.tsx`

| ID | Feedback | Aceite | Decisão proposta |
| --- | --- | --- | --- |
| `S3-LED-01` | Revisar KPIs | Cortar redundantes | **Manter:** em atenção, convertidos, taxa conversão, com interação. **Remover:** total de leads (card). |
| `S3-LED-02` | Mover gráficos p/ dashboard | Remover sidebar widgets | Implementar |
| `S3-LED-03` | Filtro padrão trabalhável | Status default: NEW, CONTACTED, QUALIFIED (+ negociação aberta se aplicável) | Implementar |
| `S3-LED-04` | Lead traz info cliente; trocar foco | Seção “Produto de interesse” no detalhe | Implementar |
| `S3-LED-05` | Remover importar + filtro header | Manter filtros na área principal | Implementar |
| `S3-LED-06` | Ver detalhes → modal | Modal com resumo + link página completa | Implementar |
| `S3-LED-07` | Cores padronizadas | Tokens + KpiCard | Implementar |

---

## Negociações

**Épico:** `S3-EPIC-06`  
**Arquivos:** `deals-page-content.tsx`, `NegotiationsMetricCard.tsx`, `ImportantActivitiesCard.tsx`, `negotiations-metrics.ts`

| ID | Feedback | Aceite |
| --- | --- | --- |
| `S3-NEG-01` | Colorir KPIs | `KpiCard` brand/success/warning |
| `S3-NEG-02` | Cores padronizadas | Tokens pipeline |
| `S3-NEG-03` | Agenda de atividades | Agenda interna por usuário + calendário mensal |
| `S3-NEG-04` | Remover mocks métricas | Dados reais do pipeline |

---

## Veículos

**Épico:** `S3-EPIC-07`  
**Arquivo:** `vehicles-page-content.tsx`

| ID | Feedback | Aceite |
| --- | --- | --- |
| `S3-VEH-01` | Paginação com seletor | `TablePagination` |
| `S3-VEH-02` | Cores padronizadas | Tokens |

---

## Lojas

**Épico:** `S3-EPIC-08`  
**Arquivos:** `StoresManagementScreen.tsx`, `StoreForm.tsx`, `store-catalog-view.ts`, backend stores

| ID | Feedback | Aceite |
| --- | --- | --- |
| `S3-STR-01` | Lista acima, gráficos abaixo | Reordenar layout |
| `S3-STR-02` | Remover export header | Remover ação |
| `S3-STR-03` | Paginação padronizada | `TablePagination` |
| `S3-STR-04` | Editar campos completos | Migration + form: name, city, state, region, addressLine, ownerName |
| `S3-STR-05` | Cores padronizadas | Tokens; gráficos neutros |

**Nota técnica:** schema atual só tem `name`. Persistência completa confirmada pelo PO — exige migration.

---

## Equipes

**Épico:** `S3-EPIC-09`  
**Arquivos:** `TeamsManagementScreen.tsx`, form de equipe

| ID | Feedback | Aceite |
| --- | --- | --- |
| `S3-TEA-01` | Modal membros (foto, nome, função, email) | Novo dialog |
| `S3-TEA-02` | Edição atribuir membros mesma loja | Multi-select + API update |
| `S3-TEA-03` | Remover disclaimer modal | Remover copy |
| `S3-TEA-04` | Distribuição loja sem cor | Monocromático |
| `S3-TEA-05` | Cores padronizadas | Tokens |

---

## Usuários

**Épico:** `S3-EPIC-10`  
**Arquivos:** `UsersManagementScreen.tsx`, backend users/access-groups

| ID | Feedback | Aceite |
| --- | --- | --- |
| `S3-USR-01` | Refactor UI total | Alinhar shell CRM |
| `S3-USR-02` | Editar nome, email, papel, grupo, equipe, senha | Form completo |
| `S3-USR-03` | Múltiplos grupos sem hierarquia | Junction table; união explícita de features |
| `S3-USR-04` | Cores padronizadas | Tokens |

**Regra de negócio:** gerente geral **não** herda automaticamente permissões de atendente.

---

## Audit Log

**Épico:** `S3-EPIC-11`  
**RF:** `RF07`

| ID | Feedback | Aceite |
| --- | --- | --- |
| `S3-AUD-01` | Criação completa front/back/banco | API + UI + cobertura eventos |
| `S3-AUD-02` | Design sistema | Zebra, filtros, paginação |
| `S3-AUD-03` | Admin only | Guard backend + rota front |

**Eventos mínimos:** LOGIN, CREATE/UPDATE/DELETE em Customer, User, Team, Lead, Deal.

---

## Rastreabilidade feedback → épico

| Tema cliente | Épicos |
| --- | --- |
| Padronização cores/KPIs | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11 |
| Dashboard operacional | 02 |
| Dashboard analítico | 03 |
| Clientes | 04 |
| Leads | 05 |
| Negociações + Calendar | 06 |
| Veículos | 07 |
| Lojas | 08 |
| Equipes | 09 |
| Usuários | 10 |
| Audit log | 11 |

## Próximos passos

1. Validar decisões de KPI (`S3-CLI-01`, `S3-LED-01`) com PO na abertura da sprint.
2. Executar EPIC-01 antes das refatorações visuais.
3. Marcar cada ID como Done no review da sprint.
