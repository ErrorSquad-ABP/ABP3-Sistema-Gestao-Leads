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
- `customers`
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
- gestão de clientes;
- gestão de lojas;
- gestão de equipas;
- gestão administrativa de utilizadores;
- telas de erro e redirect customizadas.

Ainda não fecha como produto:

- dashboards reais;
- módulo de negociações;
- logs administrativos.

## Rotas relevantes

- `/login`
- `/forgot-password`
- `/app/profile`
- `/app/leads`
- `/app/customers`
- `/app/stores`
- `/app/teams`
- `/app/users`
- `/app/dashboard/operational`
- `/app/dashboard/analytic`

## Observações

- os dashboards atuais ainda são placeholders;
- `/app/operations` é só alias de compatibilidade para `/app/stores`;
- o frontend não é autoridade de autorização: o backend continua sendo a fonte de verdade para `RBAC`.
