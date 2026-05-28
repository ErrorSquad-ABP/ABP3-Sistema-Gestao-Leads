# Sprint 3 Design System — Quantum CRM

## Objetivo

Definir a fundação visual da Sprint 3: tokens CSS pastel, componentes compartilhados, utilitários de cor para gráficos, padrão zebra e guia de migração de cores hardcoded.

Esta fundação é bloqueante para os épicos visuais da Sprint 3 porque permite adoção gradual sem redesenhar telas inteiras no mesmo PR.

## Regra de Compatibilidade Incremental

Nenhum componente novo deve exigir migração imediata das telas existentes.

`KpiCard`, `TablePagination` e `chart-colors.ts` devem coexistir com implementações inline atuais até que os épicos consumidores façam adoção gradual.

A Sprint 3 deve permitir adoção incremental sem breaking visual global. Isso protege o projeto contra refactors em cascata, PRs gigantes e regressão visual ampla.

## Inventário Visual

Antes de criar tokens finais, o inventário visual deve separar cores ativas de produção, demos e assets.

Comando base:

```bash
rg -n "#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(" front/src --glob "!assets/**" --glob "!components/shadcn-space/**"
```

Prioridade de leitura:

| Diretório | Uso |
| --- | --- |
| `front/src/features` | Telas de produção e dívida visual real |
| `front/src/components/ui` | Primitivos shadcn/ui adaptados |
| `front/src/components/shared` | Componentes compartilhados existentes |
| `front/src/app/styles.css` | Tokens globais |
| `front/src/lib` | Utilitários visuais |

Excluir do inventário principal:

- `front/src/assets`;
- logos e SVGs;
- `front/src/components/shadcn-space`;
- templates/demos.

Categorias encontradas no inventário inicial:

| Categoria | Valores recorrentes | Decisão |
| --- | --- | --- |
| Marca | `#d96c3f`, `#D96C3F`, `#f05a28`, `#f4511e`, `#ff4f1f` | Consolidar em `--brand-accent` e `--brand-accent-hover` |
| Fundos brand | `#fff3ec`, `#fff1eb`, `#ffe5d6` | Migrar para `--brand-accent-soft` e `--kpi-surface-brand` |
| Bordas | `#dbe4ef`, `#d8e0ea`, `#e7edf5`, `#e6ecf3` | Migrar para `--border` ou `--table-border` |
| Fundos suaves | `#f8fafc`, `#f1f4f8`, `#eef2f7` | Migrar para `--table-row-alt`, `--table-header-bg` ou `--muted` |
| Texto principal | `#101828`, `#06142b`, `#1b2430`, `#1e293b` | Migrar gradualmente para `--foreground` |
| Texto secundário | `#667085`, `#66708a`, `#6b7687`, `#7a8494` | Migrar gradualmente para `--muted-foreground` |
| Sucesso | `#22c55e`, `#16a34a`, `#079455`, `#009966` | Migrar para `--text-positive` e `--kpi-icon-success` |
| Erro/perigo | `#ef4444`, `#b8403a`, `#dc3f13` | Migrar para `--destructive` e `--text-negative` |
| Brand source | WhatsApp, Instagram, Facebook, Mercado Livre | Centralizar em `chart-colors.ts` via tokens `--chart-source-*` |

## Política Anti-Proliferação de Tokens

Criar tokens somente quando houver reutilização real ou semântica transversal.

Regras:

- criar tokens reutilizáveis;
- evitar tokens de uso único;
- preferir tokens semânticos;
- não criar tokens por tela;
- não duplicar tokens já cobertos por `--foreground`, `--muted`, `--border` ou `--brand-accent`;
- mapear cores repetidas antes de criar tokens novos.

Bom token:

```css
--table-row-alt: #fbfdff;
--chart-performance-below: #d48484;
--text-negative: #b8403a;
```

Token ruim:

```css
--dashboard-operational-card-3-purple-bg: #f4edff;
```

Token redundante:

```css
--soft-border-blue: #dbe4ef;
```

Se `--border` ou `--table-border` já cobrir o uso, não criar outro.

## Tokens CSS

Arquivo fonte: `front/src/app/styles.css`.

Tokens existentes mantidos:

| Token | Uso |
| --- | --- |
| `--brand-accent` | Marca, CTA e destaque principal |
| `--brand-accent-soft` | Fundo brand suave |
| `--background`, `--foreground`, `--card`, `--border`, `--muted`, `--ring` | Base shadcn/ui |

Tokens Sprint 3 adicionados:

| Grupo | Tokens |
| --- | --- |
| Marca | `--brand-accent-muted`, `--brand-accent-hover` |
| KPI surface | `--kpi-surface-brand`, `--kpi-surface-success`, `--kpi-surface-warning`, `--kpi-surface-neutral`, `--kpi-surface-danger-soft` |
| KPI icon | `--kpi-icon-brand`, `--kpi-icon-success`, `--kpi-icon-warning`, `--kpi-icon-neutral`, `--kpi-icon-danger-soft` |
| Texto semântico | `--text-positive`, `--text-negative`, `--text-warning` |
| Gráficos | `--chart-bar-default`, `--chart-bar-alt`, `--chart-performance-below`, `--chart-performance-ok`, `--chart-neutral`, `--chart-cold`, `--chart-warm`, `--chart-hot` |
| Origem | `--chart-source-whatsapp`, `--chart-source-instagram`, `--chart-source-facebook`, `--chart-source-mercado-livre`, `--chart-source-phone`, `--chart-source-store`, `--chart-source-indication`, `--chart-source-website` |
| Tabelas | `--table-row-alt`, `--table-row-hover`, `--table-header-bg`, `--table-border` |

Todo token útil para classes Tailwind deve ter alias correspondente em `@theme inline`.

## Convenções de Exportação

Usar named exports diretos no arquivo de origem.

Imports esperados:

```ts
import { KpiCard } from "@/components/metrics/KpiCard";
import { TablePagination } from "@/components/data/TablePagination";
import { chartSeriesColor } from "@/lib/charts/chart-colors";
```

Regras:

- não criar barrel global;
- não usar `export default`;
- não importar componentes compartilhados a partir de `features`;
- usar alias `@/`;
- exportar helpers puros nominalmente.

Essa convenção melhora tree-shaking, reduz risco de imports circulares e mantém previsibilidade arquitetural.

## Componente `KpiCard`

Arquivo: `front/src/components/metrics/KpiCard.tsx`.

API pública:

```ts
type KpiCardVariant =
  | "brand"
  | "success"
  | "warning"
  | "neutral"
  | "danger-soft";

type KpiCardDelta = {
  value: string;
  tone: "positive" | "negative" | "neutral";
  label?: string;
};

type KpiCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: KpiCardVariant;
  delta?: KpiCardDelta;
  sparkline?: React.ReactNode;
  sparklineLabel?: string;
  action?: React.ReactNode;
  className?: string;
};
```

Regras:

- componente genérico, sem dependência de dashboards;
- `sparkline` é slot, não lógica interna;
- `sparkline` é decorativo por padrão e recebe `role="img"` apenas quando `sparklineLabel` for informado;
- delta sempre usa texto além de cor;
- variantes usam tokens pastel;
- não obriga adoção imediata em telas existentes.

## Componente `TablePagination`

Arquivo: `front/src/components/data/TablePagination.tsx`.

API pública:

```ts
type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizeOptions: readonly number[];
  itemLabel?: string;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
};
```

Helper puro obrigatório:

```ts
function buildPaginationItems(
  page: number,
  totalPages: number,
): Array<number | "ellipsis-start" | "ellipsis-end">
```

Regras:

- não define page size global;
- consumidor decide opções e reset de página;
- seletor de page size é opcional;
- entradas inválidas em runtime são normalizadas para evitar navegação quebrada;
- botões anterior/próximo têm `aria-label`;
- página ativa usa `aria-current="page"`;
- coexiste com paginações inline atuais.

## Utilitário `chart-colors.ts`

Arquivo: `front/src/lib/charts/chart-colors.ts`.

Exports:

```ts
import {
  CHART_COLORS,
  SOURCE_BRAND_COLORS,
  chartSeriesColor,
  sourceBrandColor,
  statusBarColor,
  storePerformanceColor,
} from "@/lib/charts/chart-colors";
```

Regras:

- retornar strings CSS com `var(--token)`;
- aceitar aliases de origem (`WHATSAPP`, `whatsapp`, `digital-form`, etc.);
- fallback neutro em origem desconhecida;
- não acoplar a uma tela específica.

## Padrão Zebra

Tokens:

- `--table-row-alt`;
- `--table-row-hover`;
- `--table-header-bg`;
- `--table-border`.

Aplicação opt-in:

```tsx
<TableBody className="[&_tr:nth-child(even)]:bg-[color:var(--table-row-alt)]">
```

Não alterar `TableRow` globalmente nesta task para evitar regressão visual ampla.

## Validação de Contraste

Critério:

- texto normal: WCAG AA `4.5:1`;
- texto grande e ícones informativos: mínimo `3:1`;
- nenhum estado depende apenas de cor.

Resultados de contraste dos tokens centrais:

| Combinação | Resultado aproximado | Status |
| --- | --- | --- |
| `--foreground` sobre `--kpi-surface-brand` | > 13:1 | OK |
| `--foreground` sobre `--kpi-surface-success` | > 13:1 | OK |
| `--muted-foreground` sobre `--card` | > 4.5:1 | OK |
| `--muted-foreground` sobre `--table-row-alt` | > 4.5:1 | OK |
| `--text-positive` sobre branco | > 5:1 | OK |
| `--text-negative` sobre branco | > 5:1 | OK |
| `--text-warning` sobre branco | > 5:1 | OK |
| `--brand-accent-hover` sobre `--brand-accent-soft` | > 5:1 | OK para texto |

## Ordem de Implementação

Ordem segura:

1. inventário visual;
2. `styles.css` + tokens;
3. `chart-colors.ts`;
4. `KpiCard`;
5. `TablePagination`;
6. documentação final;
7. validação de contraste;
8. lint/typecheck.

Essa ordem reduz risco porque tokens deixam de ser especulativos, utilitários nascem em cima da base global, componentes não introduzem hex novos e a documentação final reflete a implementação real.

## Riscos Arquiteturais

| Risco | Impacto | Probabilidade | Mitigação |
| --- | --- | --- | --- |
| Explosão de tokens | CSS difícil de manter | Média | Inventário e política anti-proliferação |
| Inconsistência semântica | Token usado com sentido errado | Média | Nomear por função, não por tela |
| Acoplamento ao dashboard | Componentes pouco reutilizáveis | Média | Props genéricas e slots |
| Regressão visual silenciosa | Telas mudam sem intenção | Baixa | Não migrar telas nesta task |
| Conflito Tailwind x CSS vars | Classes não resolvem | Média | Registrar tokens em `:root` e `@theme inline` |
| Imports inconsistentes | Dívida arquitetural | Média | Named exports e imports diretos |
| Docs divergentes | Spec perde confiabilidade | Média | Atualizar docs após implementação |

## Fora de Escopo

Esta task não migra dashboards, não refatora páginas existentes, não substitui todos os hex do sistema, não altera componentes globais do shadcn/ui, não redesenha features e não muda lógica de negócio.

O escopo é somente fundação visual, componentes compartilhados, tokens, utilitários e documentação.

## Checklist de PR

- [x] Inventário visual concluído
- [x] Tokens documentados
- [x] Tokens adicionados em `styles.css`
- [x] Nenhum hex novo hardcoded em componentes novos
- [x] `chart-colors.ts` criado
- [x] `KpiCard` reutilizável criado
- [x] `TablePagination` reutilizável criado
- [x] `buildPaginationItems` testado
- [x] Acessibilidade/contraste validado
- [x] Imports consistentes com alias `@/`
- [x] Sem barrels globais novos
- [x] Sem libs novas
- [x] Sem alteração de lógica de negócio
- [x] Sem migração de dashboards nesta task
- [x] Documentação atualizada
- [x] Lint ok
- [x] Typecheck ok
