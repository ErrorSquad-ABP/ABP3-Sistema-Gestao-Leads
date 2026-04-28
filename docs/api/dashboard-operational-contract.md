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

- Parâmetros opcionais: `startDate` e `endDate` (ISO-8601).
- Regra:
- ambos devem ser enviados juntos; caso contrário, `400`.
- `startDate < endDate`; caso contrário, `400`.
- padrão quando omitidos: últimos `30` dias.
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
      "startDate": "2026-03-29T00:00:00.000Z",
      "endDate": "2026-04-28T00:00:00.000Z",
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

## Campos canônicos para frontend

- `period.startDate`
- `period.endDate`
- `period.days`
- `scope.role`
- `scope.storeIds`
- `totals.totalLeads`
- `totals.totalLeadsWithOpenDeal`
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
