# Frontend

## Objetivo

O `front` é a aplicação web autenticada do CRM. Ele consome a API do `back` via `HTTP/JSON`, organiza a navegação por papel e entrega a experiência operacional do sistema.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- React Query
- React Hook Form + Zod

## Estrutura

```text
front/
├── src/app/
├── src/components/
├── src/features/
├── src/lib/
├── public/
└── package.json
```

## Módulos ativos

- `login`
- `profile`
- `leads`
- `lead-detail`
- `customers`
- `vehicles`
- `deals`
- `dashboards`
- `stores`
- `teams`
- `users`

## Estado atual

Hoje o frontend já possui:

- login funcional;
- shell autenticado;
- redirecionamento por papel;
- perfil com atualização de credenciais;
- CRUD de leads;
- detalhe operacional de lead com timeline;
- gestão de clientes;
- catálogo e gestão visual de veículos;
- pipeline e gestão de negociações;
- dashboards operacional e analítico com dados reais;
- gestão de lojas;
- gestão de equipas;
- gestão administrativa de utilizadores;
- identidade visual `Quantum CRM`;
- telas de erro e redirect customizadas.

Ainda fica para refinamento da Sprint 3:

- ajustes visuais finos para apresentação final;
- consistência de componentes entre telas;
- tela administrativa final de audit log completo.

## Rotas relevantes

- `/login`
- `/forgot-password`
- `/app/profile`
- `/app/leads`
- `/app/leads/[id]`
- `/app/customers`
- `/app/vehicles`
- `/app/deals`
- `/app/stores`
- `/app/teams`
- `/app/users`
- `/app/dashboard/operational`
- `/app/dashboard/analytic`

## Observações

- `/app/operations` é só alias de compatibilidade para `/app/stores`;
- o frontend não é autoridade de autorização: o backend continua sendo a fonte de verdade para `RBAC`.
