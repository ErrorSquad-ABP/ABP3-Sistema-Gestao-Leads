# Sprint 3 Design System — Quantum CRM

## Objetivo

Definir a fundação visual da Sprint 3: tokens, componentes compartilhados e regras de cor para KPIs e gráficos, garantindo conforto visual e consistência entre telas.

## Contexto

O produto atualmente mistura múltiplas paletas de laranja e cores saturadas por gráfico. O parceiro solicitou padronização, simplicidade e KPIs coloridos porém em **menor contraste/saturação**. Este documento é a referência única para implementação na Sprint 3.

## Direção adotada

- ancorar a identidade em `--brand-accent` (`#d96c3f`) já usada em negociações;
- derivar tons pastel para fundos de KPI e estados suaves;
- **não** usar arco-íris por série em gráficos genéricos;
- reservar cores semânticas fortes apenas onde há significado (meta loja, importância, delta negativo);
- preferir tokens CSS a hex literal em componentes TSX.

## Tokens CSS (`front/src/app/styles.css`)

### Marca (existentes — manter)

| Token | Valor | Uso |
| --- | --- | --- |
| `--brand-accent` | `#d96c3f` | CTAs, ícones KPI primários, barras padrão |
| `--brand-accent-soft` | `#f4e6de` | Fundo KPI brand, badges suaves |

### Novos tokens Sprint 3

| Token | Valor sugerido | Uso |
| --- | --- | --- |
| `--brand-accent-muted` | `#e8b49a` | Barras secundárias, hover |
| `--kpi-surface-brand` | `#faf3ef` | Fundo card KPI brand |
| `--kpi-surface-success` | `#eef5f1` | Fundo KPI positivo |
| `--kpi-surface-warning` | `#faf6ef` | Fundo KPI atenção |
| `--kpi-surface-neutral` | `#f4f6f8` | Fundo KPI neutro |
| `--chart-bar-default` | `var(--brand-accent)` | Barras genéricas (status) |
| `--chart-bar-alt` | `#c85a32` | Segundo tom laranja |
| `--chart-performance-below` | `#e8a598` | Loja abaixo de 25% (danger suave) |
| `--chart-performance-ok` | `#a8cfc0` | Loja na meta (success suave) |
| `--chart-neutral` | `#b8c2ce` | Origens sem brand |
| `--table-row-alt` | `#f7f9fb` | Linha par zebra |
| `--text-positive` | `#2d6a4f` | Delta positivo |
| `--text-negative` | `#b8403a` | Delta negativo |

### Deprecados (migrar e remover)

| Hex legado | Onde aparece hoje | Substituir por |
| --- | --- | --- |
| `#ff4f1f` | Dashboard operacional | `--brand-accent` |
| `#ff5722` | Dashboard analítico | `--brand-accent` |
| `#f05a28` | Leads | `--brand-accent` |
| `#fff3ec` / `#ffe5d6` | Gradientes KPI operacional | `--kpi-surface-brand` |

## Componente `KpiCard`

**Arquivo alvo:** `front/src/components/metrics/KpiCard.tsx`

### API proposta

```tsx
type KpiCardVariant = 'brand' | 'success' | 'warning' | 'neutral';

type KpiCardProps = {
  title: string;
  value: string;
  hint?: string;
  delta?: { value: string; tone: 'up' | 'down' | 'neutral' };
  icon?: React.ReactNode;
  variant?: KpiCardVariant;
  sparkline?: React.ReactNode; // opcional, mesma cor do variant
};
```

### Regras visuais

- fundo: token `--kpi-surface-*` do variant;
- ícone: `--brand-accent` para `brand`; tons dessaturados para demais;
- **proibido** roxo/verde/neon distinto por card sem significado semântico;
- delta sempre com texto + cor (`--text-positive` / `--text-negative`);
- border: `border-border/80`, radius alinhado ao shell (`rounded-[1.25rem]`).

## Regras de cor por tipo de gráfico

Implementação alvo: `front/src/lib/charts/chart-colors.ts`

### 1. Barras genéricas (leads por status)

- **uma cor fixa** ou escala de 2–3 tons de laranja;
- não colorir por status individual.

### 2. Barras por loja (performance)

```ts
function storeBarColor(share: number, threshold = 0.25): string {
  return share < threshold
    ? 'var(--chart-performance-below)'
    : 'var(--chart-performance-ok)';
}
```

- `share = storeCount / periodTotal`;
- legenda textual obrigatória (“Abaixo de 25%” / “Na meta ou acima”).

### 3. Origem (donut/bar)

Mapa `SOURCE_BRAND_COLORS` (exemplos):

| Origem | Cor |
| --- | --- |
| Instagram | `#E4405F` (levemente dessaturada na UI: `#d9577a`) |
| Facebook | `#1877F2` → `#5a8fd4` |
| Mercado Livre | `#FFE600` → `#d4c04a` |
| WhatsApp | `#25D366` → `#6fbf8a` |
| Google | `#4285F4` → `#7a9fd4` |
| Outros / desconhecido | `var(--chart-neutral)` |

### 4. Importância

Manter semântica, reduzir saturação:

| Nível | Cor token |
| --- | --- |
| COLD | `#6b8fc7` |
| WARM | `var(--brand-accent-muted)` |
| HOT | `#d48484` |

### 5. Equipes / séries analíticas

- substituir rainbow por tons de laranja + neutro;
- máximo 3 cores distintas por gráfico.

## Paginação padrão (`TablePagination`)

**Arquivo alvo:** `front/src/components/data/TablePagination.tsx`

| Contexto | Default | Opções |
| --- | --- | --- |
| Clientes (Sprint 3) | 5 | 5, 10, 15, 20, 25, 30 |
| Lojas / Equipes | 6 | 6, 12, 18, 24 |
| Leads | 10 | 10, 20, 30, 40, 50 |
| Veículos | 8 | 8, 16, 24, 32 |
| Usuários | 10 | 10, 20, 50, 100 |
| Audit log | 20 | 10, 20, 50, 100 |

Props mínimas: `page`, `pageSize`, `totalItems`, `pageSizeOptions`, `onPageChange`, `onPageSizeChange`.

## Tabelas zebra

```tsx
<tr className="odd:bg-white even:bg-[color:var(--table-row-alt)]">
```

- aplicar em clientes, lojas, equipes, usuários, audit log;
- manter hover sutil (`hover:bg-muted/50`).

## KPIs — matriz de valor (decisões Sprint 3)

| Tela | Manter | Revisar / fundir | Remover da tela |
| --- | --- | --- | --- |
| Dashboard operacional | conversão, ativos, convertidos | total vs ativos | — |
| Dashboard analítico | conversão, convertidos, perdidos, tempo médio | — | — |
| Clientes | clientes com negociações | total vs ativos | taxa retenção se redundante |
| Leads | em atenção, taxa conversão | total vs com interação | total se filtro já mostra trabalháveis |
| Negociações | funil, abertas, ganhas | taxa conversão | fallbacks mock |
| Lojas | ativas, conversão média | leads no período | — |
| Usuários | total cadastrado | “nesta página” | — |

Decisões finais devem ser registradas em [`sprint-3-client-feedback-spec.md`](./sprint-3-client-feedback-spec.md) após validação com PO.

## Impactos e implicações

- EPIC-01 bloqueia refatoração das demais telas;
- remoção de hex exige busca global antes do merge;
- brand colors de origem devem respeitar contraste com fundo branco.

## Próximos passos

1. Implementar tokens e componentes (EPIC-01).
2. Migrar dashboards (EPIC-02, EPIC-03).
3. Propagar para CRM e admin (EPIC-04–10).
4. Atualizar seção 5.6 do documento IHC.
