# Runbook - Deploy e Operação da Stack

## Objetivo

Este documento descreve o procedimento operacional mínimo para subir a stack do projeto no estado atual, tanto em ambiente local via Docker Compose quanto em produção na Vercel com banco Neon.

Ele não substitui uma estratégia formal de produção com observabilidade, rollback e gestão avançada de segredos. O objetivo aqui é registrar o procedimento real que a equipe já usa para colocar `front`, `back` e `postgres` de pé sem depender de memória individual.

## Estado atual do projeto

### Local com Docker Compose

A stack atual é composta por:

- `postgres`
- `prisma-migrate`
- `back`
- `front`

Definições principais:

- [docker-compose.yml](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/docker-compose.yml)
- [docker-compose.dev.yml](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/docker-compose.dev.yml)

### Produção atual

Produção publicada:

- `front`: `https://abp3-sistema-gestao-leads-front.vercel.app`
- `back`: `https://abp3-sistema-gestao-leads-back.vercel.app`
- `database`: Neon PostgreSQL

Topologia:

- o `front` publica um rewrite de `/api/*` para o projeto `back`
- autenticação e RBAC continuam no backend
- o banco produtivo usa migrations Prisma e seed explícito

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

Para massa analítica maior:

```bash
SEED_MODE=dashboard npm run db:seed
```

## Verificações mínimas pós-deploy

### Frontend

- `http://localhost:3000`
- `http://localhost:3000/login`

### Backend

- `http://localhost:3001/api/health`
- `http://localhost:3001/api/health/ready`

### Produção

- `https://abp3-sistema-gestao-leads-front.vercel.app`
- `https://abp3-sistema-gestao-leads-front.vercel.app/api/health`
- `https://abp3-sistema-gestao-leads-back.vercel.app/api/health`

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

### Smoke mínimo de produção

1. Abrir `https://abp3-sistema-gestao-leads-front.vercel.app/login`
2. Autenticar com `admin@crm.com / admin123`
3. Confirmar acesso a:
   - `/app/leads`
   - `/app/users`
   - `/app/profile`
4. Confirmar `403` para utilizador de perfil restrito em rota administrativa
5. Confirmar listagem de leads e utilizadores com dados seedados

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

### Observação de contrato

O modelo atual de utilizador não deve mais ser interpretado como `um utilizador = um time`.

Fonte canônica:

- `memberTeamIds`
- `managedTeamIds`

Compatibilidade temporária:

- `teamId` ainda pode aparecer em respostas para não quebrar consumidores antigos

Regra operacional:

- se houver dúvida entre `teamId` e os arrays, os arrays vencem;
- autorização por escopo deve usar o modelo multi-team;
- `accessGroup` complementa navegação e toggles, mas não substitui `role` nem vínculo organizacional.

## Fluxos que ainda não são deploy-ready como feature completa

- recuperação automática de senha por e-mail

Os fluxos abaixo já existem e estão operacionais no estado atual:

- gestão administrativa de utilizadores em `/app/users`
- perfil e atualização de credenciais em `/app/profile`
- CRUD operacional de leads com catálogo escopado por RBAC em `/app/leads`

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

### Produção sobe, mas listagens administrativas respondem `400`

Verifique:

- se o seed usado foi o dataset atualizado da `main`
- se não há dados antigos incompatíveis com o domínio atual de `Name`
- se a Neon recebeu `migrate deploy` antes do `db:seed`

### CRUD de leads abre, mas selects de loja ou responsável ficam vazios

Verifique:

- se o utilizador autenticado realmente tem escopo de leitura/mutação em equipes ou lojas
- se o catálogo do backend responde:
  - `/api/leads/catalog/stores`
  - `/api/leads/catalog/owners`
- se o utilizador possui vínculos canônicos em `memberTeamIds` ou `managedTeamIds`

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
