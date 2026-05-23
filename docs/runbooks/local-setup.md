# Runbook - Setup Local

## Objetivo

Subir o Quantum CRM localmente em **um dos quatro modos** abaixo. Não misture modos na mesma sessão sem `stop` / encerrar processos.

## Pré-requisitos

- `Node.js >= 22` e `npm >= 10` (obrigatório para modos **native**)
- `Docker` + `Docker Compose` (obrigatório apenas para modos **docker**)
- `back/.env` criado a partir de `back/.env.example`
- `front/.env` criado a partir de `front/.env.example` (modos native)

Windows sem Docker Desktop: [setup-windows.md](./setup-windows.md).

## Os quatro modos (oficial)

| Comando | Docker | Banco de dados | Quando usar |
| --- | --- | --- | --- |
| `npm run start:docker:remote` | Sim (back + front) | `DATABASE_URL` em `back/.env` (Neon / remoto) | Padrão com Docker; mesmo banco do time na nuvem |
| `npm run start:docker:local` | Sim (+ Postgres) | Postgres no Compose (`abp:abp@postgres:5432`) | Docker sem depender de Neon/rede externa |
| `npm run start:native:remote` | Não | `DATABASE_URL` em `back/.env` | **PCs sem Docker**; Node direto no host |
| `npm run start:native:local` | Não | `127.0.0.1:5433` (script fixa a URL) | Node + Postgres local (`npm run db:up` ou instalado) |

### Parar stacks Docker

```bash
npm run stop:docker:remote
npm run stop:docker:local   # remove volume do Postgres local
```

### Aliases legados

| Antigo | Novo |
| --- | --- |
| `npm run dev` | `start:docker:remote` |
| `npm run dev:local` | `start:docker:local` |
| `npm run dev:down` | `stop:docker:remote` |

## Portas

| Serviço | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:3001` |
| Health | `http://localhost:3001/api/health` |
| Readiness (Postgres) | `http://localhost:3001/api/health/ready` |

No Docker, o front só sobe quando `/api/health/ready` do back retorna OK (liga ao banco).

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar `back/.env`

```bash
cp back/.env.example back/.env
```

| Modo | O que colocar em `DATABASE_URL` |
| --- | --- |
| `*:remote` | URL completa Neon (ou Postgres remoto acessível do host/rede) |
| `start:docker:local` | Pode existir no arquivo; o Compose **sobrescreve** para o Postgres interno |
| `start:native:local` | Ignorada pelo script; usa `postgresql://abp:abp@127.0.0.1:5433/lead_management` |

Sempre preencher: chaves JWT, `JWT_ISSUER`, `JWT_AUDIENCE`, `FRONTEND_ORIGINS=http://localhost:3000`.

**Erro clássico:** `DATABASE_URL=...@localhost:5433` com `start:docker:remote`. Dentro do container, `localhost` é o próprio back → back `unhealthy` → front `failed dependency`. Use Neon no `.env` ou mude para `start:docker:local`.

## 3. Subir

Escolha **um** comando da tabela dos quatro modos.

Modo native exige `front/.env`:

```bash
cp front/.env.example front/.env
```

## 4. Postgres só para `native:local` (opcional)

Sem instalar Postgres no SO, suba só o banco via Docker:

```bash
npm run db:up
npm run db:migrate:local
npm run db:seed:local
npm run start:native:local
```

```bash
npm run db:down
```

## 5. Migrations

Banco apontado por `back/.env` (modos `*:remote`):

```bash
npm run db:migrate
```

Postgres em `127.0.0.1:5433`:

```bash
npm run db:migrate:local
```

No `start:docker:local`, migrations rodam no serviço `local-bootstrap` antes do back.

## 6. Seed

```bash
npm run db:seed
npm run db:seed:local
```

`db:seed` é **destrutivo** no banco da `DATABASE_URL` atual.

No `start:docker:local`, o seed automático só roda se a base local estiver vazia.

## 7. Credenciais bootstrap

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@crm.com` | `admin123` |
| Gerente Geral | `geral@crm.com` | `admin123` |
| Gerente | `gerente@crm.com` | `admin123` |
| Atendente | `atendente@crm.com` | `admin123` |

## 8. Verificação mínima

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/ready
```

1. Abrir `http://localhost:3000/login`
2. Entrar com `admin@crm.com / admin123`
3. Confirmar `/app/leads`

```bash
npm run smoke:http -w back
```

## 9. Problemas comuns

### Back `unhealthy` no Docker

- Ver `docker logs abp3-back`
- Testar `curl http://localhost:3001/api/health/ready`
- Corrigir `DATABASE_URL` ou usar `start:docker:local`

### `401` no login

- Seed não executado ou banco diferente do esperado

### Backend não sobe (native)

- Node &lt; 22
- JWT vazio no `.env`
- Prisma em WSL1 — ver [setup-windows.md](./setup-windows.md)

### Front: `EACCES` / Turbopack panic / `Permission denied` em `front/.next`

Causa típica: rodou **Docker antes** e o cache `.next` ficou com dono `root` no host; o `start:native:*` não consegue escrever.

Correção (Linux/macOS):

```bash
sudo chown -R "$USER:$USER" front/.next
npm run clean:dev
npm run start:native:remote
```

Ou, se preferir apagar tudo de uma vez:

```bash
sudo rm -rf front/.next
npm run start:native:remote
```

A partir desta versão, o Compose de dev guarda `.next` em volume Docker (não mistura mais com native). Se o problema já existir, a limpeza acima ainda é necessária **uma vez**.

Os `401` em `GET /api/auth/me` antes do login são normais.
