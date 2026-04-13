# Runbook - Deploy e Operação da Stack

## Objetivo

Este documento descreve o procedimento operacional mínimo para subir a stack do projeto no estado atual, com foco em ambientes controlados por Docker Compose.

Ele não substitui uma estratégia formal de produção com reverse proxy, observabilidade, TLS e gestão de segredos. O objetivo aqui é registrar o procedimento real que a equipe já usa para colocar `front`, `back` e `postgres` de pé sem depender de memória individual.

## Estado atual do projeto

A stack atual é composta por:

- `postgres`
- `prisma-migrate`
- `back`
- `front`

Definições principais:

- [docker-compose.yml](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/docker-compose.yml)
- [docker-compose.dev.yml](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/docker-compose.dev.yml)

## Variáveis obrigatórias

Para a stack com Compose, o backend depende destas variáveis na raiz do projeto:

```env
JWT_ACCESS_PRIVATE_KEY=...
JWT_ACCESS_PUBLIC_KEY=...
JWT_ISSUER=abp3-leads-api
JWT_AUDIENCE=abp3-leads-api
FRONTEND_ORIGINS=http://localhost:3000
```

Sem elas:

- `abp3-back` não inicia
- o `AuthModule` falha no bootstrap

## Procedimento de subida

### 1. Build e subida

```bash
docker compose up --build
```

Ou, via script da raiz:

```bash
npm run compose:up
```

### 2. O que esperar nos logs

#### PostgreSQL

- container saudável
- banco `lead_management` disponível

#### Prisma migrate

- `No pending migrations to apply` ou
- migrations aplicadas com sucesso

#### Backend

- `Nest application successfully started`

#### Frontend

- `Next.js`
- `Ready`

## Pós-subida obrigatório

O Compose atual não dispara seed automático. Então, após subir:

```bash
npm run db:seed
```

## Verificações mínimas pós-deploy

### Frontend

- `http://localhost:3000`
- `http://localhost:3000/login`

### Backend

- `http://localhost:3001/api/health`
- `http://localhost:3001/api/health/ready`

### Banco

No host:

- `localhost:5433`

Credenciais padrão do Compose:

| Campo | Valor |
| --- | --- |
| Database | `lead_management` |
| User | `abp` |
| Password | `abp` |

## Smoke funcional recomendado

### Login

Testar com:

- `admin@crm.com`
- `admin123`

Resultado esperado:

- redirecionamento para a home por papel
- AppShell carregado

### API

```bash
npm run smoke:http -w back
```

## Estratégia atual de rotas autenticadas

### Entradas públicas

- `/`
- `/login`
- `/forgot-password`
- `/register` (fora do fluxo público efetivo; redirecionado para login)

### Entradas protegidas

- `/app/*`

Proteção atual:

- gate server-side no frontend
- enforcement real de autenticação e RBAC no backend

## Homes por papel

| Papel | Home |
| --- | --- |
| `ATTENDANT` | `/app/leads` |
| `MANAGER` | `/app/dashboard/operational` |
| `GENERAL_MANAGER` | `/app/dashboard/analytic` |
| `ADMINISTRATOR` | `/app/dashboard/analytic` |

## Estratégia atual de RBAC

O RBAC verdadeiro está no backend, não no frontend.

Base técnica:

- [global-auth.guard.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/back/src/shared/presentation/guards/global-auth.guard.ts)
- [roles.decorator.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/back/src/shared/presentation/decorators/roles.decorator.ts)

O frontend:

- organiza navegação por papel
- redireciona usuário
- bloqueia visualmente rotas fora do escopo esperado

Mas a autoridade final continua sendo o backend.

## Fluxos que ainda não são deploy-ready como feature completa

- gestão completa de usuários em `/app/users`
- perfil e atualização de credenciais na área autenticada
- recuperação automática de senha por e-mail

## Falhas operacionais comuns

### `abp3-back` cai no bootstrap

Verifique:

- chaves JWT no `.env` da raiz
- `JWT_ISSUER`
- `JWT_AUDIENCE`

### Frontend sobe, mas login não funciona

Verifique:

- seed executado
- `NEXT_PUBLIC_API_URL`
- `API_INTERNAL_URL`
- `FRONTEND_ORIGINS`

### Banco sobe, mas frontend ou backend continuam com estado antigo

Rebuild específico:

```bash
docker compose build front back
docker compose up -d front back
```

## Checklist operacional

- [ ] `.env` da raiz preenchido
- [ ] Compose subiu sem erro
- [ ] `prisma-migrate` concluiu com sucesso
- [ ] `npm run db:seed` executado
- [ ] `GET /api/health` retornando `200`
- [ ] Login bootstrap validado
- [ ] Home por papel validada
