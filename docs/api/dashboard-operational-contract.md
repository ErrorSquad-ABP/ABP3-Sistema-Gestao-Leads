# Dashboard Operacional (`RF04`) - Contrato Backend

## Endpoint

- `GET /api/dashboards/operational`

## Autorização e escopo

- Perfis permitidos: `MANAGER`, `GENERAL_MANAGER`, `ADMINISTRATOR`.
- `ATTENDANT` recebe `403`.
- Escopo dos dados:
- `ADMINISTRATOR`: global.
- `MANAGER` e `GENERAL_MANAGER`: somente leads das `stores` visíveis pelo escopo de equipe.

## Filtro temporal

- Parâmetros opcionais de API: `startDate` e `endDate` (ISO-8601).
- A UI operacional usa seletor de mês no formato `YYYY-MM` e envia o mês convertido para:
- `startDate`: primeiro dia do mês às `00:00:00.000Z` (inclusivo).
- `endDate`: primeiro dia do mês seguinte às `00:00:00.000Z` (exclusivo).
- Regra:
- ambos devem ser enviados juntos; caso contrário, `400`.
- `startDate < endDate`; caso contrário, `400`.
- quando omitidos, o backend mantém compatibilidade com janela móvel de `30` dias; a UI operacional não usa esse padrão.
- Semântica:
- `startDate` inclusivo.
- `endDate` exclusivo.

## Resposta

```json
{
  "success": true,
  "message": null,
  "data": {
    "period": {
      "startDate": "2026-04-01T00:00:00.000Z",
      "endDate": "2026-05-01T00:00:00.000Z",
      "days": 30
    },
    "scope": {
      "role": "MANAGER",
      "storeIds": ["2dcf8d44-8c6b-4fe5-af6b-f83540eb3d5d"]
    },
    "totals": {
      "totalLeads": 120,
      "totalLeadsWithOpenDeal": 64
    },
    "kpis": {
      "totalLeads": {
        "value": 120,
        "previousValue": 90,
        "delta": 30,
        "deltaPercentage": 33.33,
        "deltaPoints": null
      },
      "activeLeads": {
        "value": 82,
        "previousValue": 70,
        "delta": 12,
        "deltaPercentage": 17.14,
        "deltaPoints": null
      },
      "convertedLeads": {
        "value": 28,
        "previousValue": 22,
        "delta": 6,
        "deltaPercentage": 27.27,
        "deltaPoints": null
      },
      "conversionRate": {
        "value": 23.33,
        "previousValue": 24.44,
        "delta": -1.11,
        "deltaPercentage": null,
        "deltaPoints": -1.11
      }
    },
    "distributions": {
      "byStatus": [{ "key": "NEW", "count": 28, "percentage": 23.33 }],
      "bySource": [{ "key": "whatsapp", "count": 35, "percentage": 29.17 }],
      "byStore": [
        {
          "storeId": "2dcf8d44-8c6b-4fe5-af6b-f83540eb3d5d",
          "storeName": "Loja Centro",
          "count": 58,
          "percentage": 48.33
        }
      ],
      "byImportance": [{ "key": "HOT", "count": 22, "percentage": 34.38 }]
    },
    "trend": {
      "points": [
        {
          "date": "2026-04-01",
          "totalLeads": 4,
          "activeLeads": 3,
          "convertedLeads": 1,
          "conversionRate": 25
        }
      ]
    }
  },
  "errors": null
}
```

## Métricas e cálculos

- `totals.totalLeads`:
- `COUNT(leads)` no período e no escopo.
- `totals.totalLeadsWithOpenDeal`:
- `COUNT(leads com deal OPEN)` no período e no escopo.
- `kpis.totalLeads`:
- total de leads do período atual comparado com o período imediatamente anterior de mesma duração.
- `kpis.activeLeads`:
- leads abertos, definidos como status `NEW`, `CONTACTED` e `QUALIFIED`.
- `kpis.convertedLeads`:
- leads com status `CONVERTED`.
- `kpis.conversionRate`:
- `convertedLeads / totalLeads * 100`.
- `kpis.*.deltaPercentage`:
- usado para contagens; retorna `null` quando o valor anterior é zero.
- `kpis.*.deltaPoints`:
- usado para taxa de conversão, em pontos percentuais.
- `distributions.byStatus`:
- agrupamento por `lead.status` (normalizado para domínio: `NEW`, `CONTACTED`, `QUALIFIED`, `DISQUALIFIED`, `CONVERTED`).
- `distributions.bySource`:
- agrupamento por `lead.source` (normalizado para domínio: `store-visit`, `phone-call`, `whatsapp`, `instagram`, `facebook`, `mercado-livre`, `indication`, `digital-form`, `other`).
- `distributions.byStore`:
- agrupamento por `lead.storeId` + `store.name`.
- `distributions.byImportance`:
- agrupamento por `deal.importance` considerando apenas `deal.status = OPEN` e respeitando o mesmo recorte de leads.
- `percentage`:
- fórmula `count / base * 100` com 2 casas decimais.
- base para `byStatus`, `bySource`, `byStore`: `totals.totalLeads`.
- base para `byImportance`: `totals.totalLeadsWithOpenDeal`.
- `trend.points`:
- série diária dentro do período atual para sparklines, com `date`, `totalLeads`, `activeLeads`, `convertedLeads` e `conversionRate`.

## Campos canônicos para frontend

- `period.startDate`
- `period.endDate`
- `period.days`
- `scope.role`
- `scope.storeIds`
- `totals.totalLeads`
- `totals.totalLeadsWithOpenDeal`
- `kpis.totalLeads`
- `kpis.activeLeads`
- `kpis.convertedLeads`
- `kpis.conversionRate`
- `distributions.byStatus[].key`
- `distributions.byStatus[].count`
- `distributions.byStatus[].percentage`
- `distributions.bySource[].key`
- `distributions.bySource[].count`
- `distributions.bySource[].percentage`
- `distributions.byStore[].storeId`
- `distributions.byStore[].storeName`
- `distributions.byStore[].count`
- `distributions.byStore[].percentage`
- `distributions.byImportance[].key`
- `distributions.byImportance[].count`
- `distributions.byImportance[].percentage`
- `trend.points[].date`
- `trend.points[].totalLeads`
- `trend.points[].activeLeads`
- `trend.points[].convertedLeads`
- `trend.points[].conversionRate`

## Notas arquiteturais

- Não houve mudança de arquitetura do sistema para este incremento.
- A feature foi implementada como novo módulo `dashboards` no backend, reutilizando:
- política de escopo já existente (`LeadAccessPolicy`);
- convenções de controller/use-case/repository do monólito modular;
- envelope de resposta global da API.
