# Setup no Windows (sem Docker Desktop)

Use este fluxo em PCs da faculdade ou máquinas **sem** Docker Desktop / WSL2 completo.

## Pré-requisitos

| Item | Versão |
| --- | --- |
| Node.js | `>= 22` (`node -v`) |
| npm | `>= 10` |
| Git | qualquer recente |

Evite WSL1 para build/Prisma — o Prisma exige WSL2 ou Node nativo no Windows.

## 1. Clonar e instalar

```bash
git clone <url-do-repo>
cd ABP3-Sistema-Gestao-Leads
npm install
```

## 2. Variáveis de ambiente

```bash
copy back\.env.example back\.env
copy front\.env.example front\.env
```

No `back/.env`, preencha no mínimo:

- `DATABASE_URL` — URL **Neon de desenvolvimento** do time (recomendado sem Docker)
- `JWT_ACCESS_PRIVATE_KEY` / `JWT_ACCESS_PUBLIC_KEY` (PEM em uma linha com `\n`)
- `JWT_ISSUER` / `JWT_AUDIENCE`
- `FRONTEND_ORIGINS=http://localhost:3000`

## 3. Banco e seed (uma vez por ambiente)

```bash
npm run db:migrate
npm run db:seed
```

## 4. Subir o projeto (modo oficial sem Docker)

```bash
npm run start:native:remote
```

Abra:

- Front: http://localhost:3000/login
- Back health: http://localhost:3001/api/health
- Back ready (Postgres): http://localhost:3001/api/health/ready — deve retornar 200

Login demo: `admin@crm.com` / `admin123` (após seed).

## Postgres local opcional (sem Neon)

Se tiver **só** Docker para o banco (sem subir back/front em container):

```bash
npm run db:up
npm run db:migrate:local
npm run db:seed:local
npm run start:native:local
```

`start:native:local` usa `127.0.0.1:5433` automaticamente.

## Erros comuns

### `npm run dev` / Docker falha com back `unhealthy`

`npm run dev` é alias de `start:docker:remote` e **exige Docker**. Sem Docker, use `start:native:remote`.

Se usar Docker com `DATABASE_URL=localhost:5433` no `.env`, o back no container **não** alcança o Postgres — use Neon no `.env` ou `npm run start:docker:local`.

### `/api/health/ready` retorna 503

- `DATABASE_URL` incorreta ou rede da faculdade bloqueando Neon
- migrations não aplicadas: `npm run db:migrate`
- JWT incompleto no `.env`

### Prisma: “WSL 1 is not supported”

Instale Node 22 **nativo no Windows** (nodejs.org) e rode `npm run start:native:remote` fora do WSL1, ou atualize para WSL2.

### Front: erro de permissão em `.next` depois de usar Docker

Apague a pasta e suba de novo:

```bash
rmdir /s /q front\.next
npm run start:native:remote
```

No WSL/Linux após Docker: `sudo chown -R $USER:$USER front/.next` ou `npm run clean:dev`.

## Referência dos 4 modos

| Comando | Docker | Banco |
| --- | --- | --- |
| `npm run start:docker:remote` | Sim | `back/.env` (Neon) |
| `npm run start:docker:local` | Sim | Postgres no Compose |
| `npm run start:native:remote` | Não | `back/.env` (Neon) |
| `npm run start:native:local` | Não | `127.0.0.1:5433` |

Guia completo: [local-setup.md](./local-setup.md).
