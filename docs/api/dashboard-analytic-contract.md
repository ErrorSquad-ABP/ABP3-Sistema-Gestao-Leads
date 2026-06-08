# Contrato Do Dashboard Analítico

## Endpoint

`GET /api/dashboards/analytic`

O dashboard analítico atende o RF05 e reutiliza as regras temporais do RF06. O backend aplica RBAC antes de calcular qualquer métrica, portanto o frontend recebe apenas dados do escopo permitido para o usuário autenticado.

## Filtros Temporais

Parâmetros aceitos:

- `mode`: `week`, `month`, `year` ou `custom`.
- `referenceDate`: usado para `week`, `month` e `year`.
- `startDate` e `endDate`: obrigatórios em conjunto quando `mode=custom`.
- `top`: limite opcional para rankings.

Regras:

- `startDate` e `endDate` devem ser enviados juntos.
- `startDate` deve ser anterior ou igual a `endDate`.
- Usuários não administradores podem consultar no máximo 1 ano.
- Administradores não possuem limite de intervalo.

## Fórmula De Conversão

A taxa de conversão do dashboard analítico usa somente leads finalizados:

```text
finalizedLeads = convertedLeads + lostLeads
conversionRate = convertedLeads / finalizedLeads * 100
```

`lostLeads` representa leads com negociação encerrada como `LOST`. Leads ainda em andamento não entram no denominador da conversão analítica.

## KPIs

O campo `kpis` contém:

- `conversionRate`
- `convertedLeads`
- `lostLeads`
- `averageTimeToFirstInteraction`

Cada KPI retorna:

```json
{
  "value": 10,
  "previousValue": 8,
  "delta": 2,
  "deltaPercentage": 25,
  "deltaPoints": 2
}
```

`deltaPoints` é usado apenas em métricas percentuais, como taxa de conversão.

O período anterior é calculado automaticamente com a mesma duração do período atual.

## Motivos De Finalização

Negociações encerradas como `LOST` exigem `lossReason`.

Valores aceitos:

- `NO_INTEREST`: sem interesse.
- `PRICE_EXPECTATION`: preço fora da expectativa.
- `BOUGHT_ELSEWHERE`: comprou em outra loja.
- `NO_RESPONSE`: não retornou contato.
- `VEHICLE_UNAVAILABLE`: veículo indisponível.
- `OTHER`: outros.

Registros antigos sem motivo são agrupados como `OTHER`.

## Trend

O campo `trend.points` retorna pontos diários do período atual:

```json
{
  "date": "2026-05-01",
  "totalLeads": 12,
  "convertedLeads": 4,
  "lostLeads": 2,
  "conversionRate": 66.67,
  "averageTimeToFirstInteractionHours": 2.5
}
```

O frontend pode agregar esses pontos em semanas ou meses quando o período for longo, preservando a origem real dos dados.

## Resposta

Campos principais:

- `filter`: filtro efetivamente aplicado pelo backend.
- `summary`: totais consolidados do período.
- `kpis`: indicadores comparados com período anterior.
- `trend`: série temporal real.
- `byAttendant`: ranking por atendente.
- `byTeam`: ranking por equipe.
- `importanceDistribution`: distribuição por importância.
- `finalizationReasons`: motivos reais de perda/finalização.
- `averageTimeToFirstInteraction`: metodologia e suporte da média de atendimento.
- `drillDown`: listas resumidas para modais de detalhe na UI.

## Drill-down (modais da UI)

O campo `drillDown` alimenta os modais "Ver detalhes da importância" e "Ver detalhes da conversão". Cada lista retorna no máximo 50 itens, respeitando o mesmo filtro temporal e escopo RBAC do dashboard.

```json
{
  "importanceLeads": [
    {
      "id": "uuid-do-lead",
      "label": "Nome do cliente",
      "importance": "HOT"
    }
  ],
  "conversionLeads": [
    {
      "id": "uuid-do-lead",
      "label": "Nome do cliente",
      "outcome": "converted"
    }
  ]
}
```

Regras:

- `importanceLeads`: um item por lead, usando a maior classificação entre as negociações do período (`HOT` > `WARM` > `COLD`).
- `conversionLeads`: um item por lead com `outcome` em `converted`, `lost` ou `open`.
- `label` corresponde ao nome do cliente associado ao lead.
- A UI deve linkar cada item para `/app/leads/[id]`.

Valores aceitos em `importance`: `COLD`, `WARM`, `HOT`.

Valores aceitos em `outcome`:

- `converted`: lead com status `CONVERTED`.
- `lost`: lead com negociação encerrada como `LOST` e lead não convertido.
- `open`: demais leads do período ainda em andamento.
