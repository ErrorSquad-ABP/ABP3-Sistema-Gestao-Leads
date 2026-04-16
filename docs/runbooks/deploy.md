# Runbook - Deploy e Operação

## Objetivo

Registrar o procedimento real de deploy e os checks operacionais do projeto no estado atual da `main`.

## Produção atual

- Front: `https://abp3-sistema-gestao-leads-front.vercel.app`
- Back: `https://abp3-sistema-gestao-leads-back.vercel.app`
- Banco: Neon PostgreSQL

## Topologia

- `front` e `back` são projetos Vercel separados;
- o `front` publica rewrite de `/api/*` para o `back`;
- autenticação e `RBAC` seguem no backend;
- o banco usa migrations Prisma e seed explícito;
- a `main` é a branch de produção.

## Compose local

O projeto mantém dois modos locais:

- padrão do time: `front` e `back`, usando o banco definido em `back/.env`;
- secundário de conformidade: `front`, `back` e `postgres` via `docker-compose.local.yml`.

O modo secundário existe para validação isolada e aderência explícita ao requisito da ABP de execução com PostgreSQL em `Docker Compose`.

## Variáveis críticas

### Backend

- `DATABASE_URL`
- `JWT_ACCESS_PRIVATE_KEY`
- `JWT_ACCESS_PUBLIC_KEY`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `FRONTEND_ORIGINS`
- `APP_URL`

### Frontend

- `NEXT_PUBLIC_API_URL`
- `API_INTERNAL_URL`

## Deploy na Vercel

O fluxo atual de produção é:

1. merge na `main`
2. build automático de `front` e `back`
3. smoke check

## Smoke checks mínimos

### Backend

- `GET https://abp3-sistema-gestao-leads-back.vercel.app/api/health`

### Front por rewrite

- `GET https://abp3-sistema-gestao-leads-front.vercel.app/api/health`

### Login

Fazer `POST /api/auth/login` via front rewrite com:

- `admin@crm.com`
- `admin123`

Resultado esperado:

- `201`
- `accessToken` no body
- cookies HttpOnly emitidos

## Fluxos publicados

Já estão operacionais em produção:

- login
- logout
- perfil e credenciais
- gestão de utilizadores
- gestão de clientes
- gestão de lojas
- gestão de equipas
- CRUD de leads
- API de negociações
- API de veículos

Ainda não estão fechados como feature de produto:

- dashboards reais
- módulo de negociações no frontend
- módulo de veículos no frontend
- logs administrativos

## Operação de banco

### Migration

Rodar explicitamente:

```bash
npm run db:migrate
```

### Seed

Seed mínimo:

```bash
npm run db:seed
```

Seed analítico:

```bash
SEED_MODE=dashboard npm run db:seed
```

Observação:

- seed pode ser destrutivo, dependendo do script e do banco-alvo;
- em ambiente compartilhado, tratar como operação consciente.

## Homes por papel

| Papel | Destino |
| --- | --- |
| `ATTENDANT` | `/app/leads` |
| `MANAGER` | `/app/dashboard/operational` |
| `GENERAL_MANAGER` | `/app/dashboard/analytic` |
| `ADMINISTRATOR` | `/app/dashboard/analytic` |

## Falhas operacionais comuns

### Build da Vercel falha por configuração antiga

Hoje o `back/vercel.json` já não usa bloco `functions` apontando para `src/main.ts`. Se esse erro voltar, houve regressão de configuração.

### API responde `500`

Checar primeiro:

- `DATABASE_URL`
- chaves JWT
- empacotamento da Function do backend

### Login sobe, mas telas protegidas falham

Checar:

- `/api/health`
- `/api/auth/login`
- `/api/auth/me`
- envio do `Authorization: Bearer` pelo cliente
- cookies HttpOnly do auth
