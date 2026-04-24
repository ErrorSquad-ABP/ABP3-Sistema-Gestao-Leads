# Backend

## Objetivo

O `back` é a API do sistema. Ele concentra autenticação, autorização, persistência, contratos REST e as regras de negócio do domínio.

## Stack

- NestJS 11
- TypeScript
- PostgreSQL
- Prisma ORM
- Argon2
- JWT `RS256`

## Organização

```text
back/
├── src/
│   ├── modules/
│   ├── shared/
│   ├── app.module.ts
│   └── main.ts
├── prisma/
├── scripts/
└── package.json
```

## Módulos ativos

- `auth`
- `users`
- `teams`
- `stores`
- `customers`
- `leads`

## Módulos ainda não fechados como produto

- `negotiations`
- `dashboards`
- `audit-logs`

## Auth e sessão

O backend hoje opera com:

- login por e-mail e senha;
- `access token` JWT `RS256`;
- refresh token opaco persistido;
- cookies HttpOnly de auth;
- suporte a `Authorization: Bearer` para consumo do frontend.

## Variáveis críticas

- `DATABASE_URL`
- `JWT_ACCESS_PRIVATE_KEY`
- `JWT_ACCESS_PUBLIC_KEY`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `FRONTEND_ORIGINS`

## Prisma

### Migration

```bash
npm run prisma:migrate:deploy
```

### Seed

```bash
npm run prisma:seed
```

Modos:

- padrão: `minimal`
- analítico: `SEED_MODE=dashboard`

## Estado atual

Hoje o backend já entrega:

- autenticação funcional;
- `RBAC` no backend;
- modelo multi-team para escopo;
- CRUD de utilizadores;
- CRUD de equipas;
- CRUD de lojas;
- CRUD de clientes;
- CRUD de leads.

O que ainda falta como recorte de produto:

- negociações completas;
- dashboards com dados reais;
- logs administrativos completos.
