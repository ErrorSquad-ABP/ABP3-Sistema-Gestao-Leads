# Backend

## Objetivo

O `back` e a API do sistema. Ele concentra autenticacao, autorizacao, persistencia, contratos REST e regras de negocio do dominio.

## Stack

- NestJS 11
- TypeScript
- PostgreSQL
- Prisma ORM
- Argon2
- JWT `RS256`

## Organizacao

```text
back/
|-- src/
|   |-- modules/
|   |-- shared/
|   |-- app.module.ts
|   `-- main.ts
|-- prisma/
|-- scripts/
`-- package.json
```

## Modulos ativos

- `auth`
- `users`
- `teams`
- `stores`
- `customers`
- `leads`
- `dashboards` (operational)

## Modulos ainda nao fechados como produto

- `negotiations`
- `audit-logs`

## Auth e sessao

O backend hoje opera com:

- login por e-mail e senha;
- `access token` JWT `RS256`;
- refresh token opaco persistido;
- cookies HttpOnly de auth;
- suporte a `Authorization: Bearer` para consumo do frontend.

## Variaveis criticas

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

- padrao: `minimal`
- analitico: `SEED_MODE=dashboard`

## Estado atual

Hoje o backend ja entrega:

- autenticacao funcional;
- `RBAC` no backend;
- modelo multi-team para escopo;
- CRUD de utilizadores;
- CRUD de equipas;
- CRUD de lojas;
- CRUD de clientes;
- CRUD de leads;
- dashboard operacional (`RF04`) com agregacoes por status, origem, loja e importancia.

O que ainda falta como recorte de produto:

- negociacoes completas no frontend;
- dashboard analitico (`RF05`) e filtros avancados (`RF06`);
- logs administrativos completos.
