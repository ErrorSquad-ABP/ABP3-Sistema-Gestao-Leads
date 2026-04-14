# Runbook - Setup Local

## Objetivo

Este runbook descreve o bootstrap local completo do projeto no estado atual da implementação. O fluxo cobre:

- configuração de variáveis de ambiente;
- geração de chaves JWT;
- subida da stack com Docker Compose;
- migrations e seed;
- credenciais bootstrap;
- validação funcional mínima de autenticação.

## Pré-requisitos

- `Node.js >= 22`
- `npm >= 10`
- `Docker`
- `Docker Compose`

## Visão geral da stack local

| Serviço | URL / Porta | Observação |
| --- | --- | --- |
| Frontend | `http://localhost:3000` | Next.js |
| Backend | `http://localhost:3001` | NestJS |
| Healthcheck | `http://localhost:3001/api/health` | Sanidade mínima da API |
| PostgreSQL | `localhost:5433` | Host local mapeado para o container |

## 1. Clonar e instalar dependências

Na raiz do repositório:

```bash
npm install
```

## 2. Configurar o backend

Copie o exemplo versionado:

```bash
cp back/.env.example back/.env
```

Pontos importantes do `back/.env`:

- `DATABASE_URL` local deve apontar para `localhost:5433`
- `FRONTEND_ORIGINS` deve incluir `http://localhost:3000`
- o `AuthModule` exige `JWT_ACCESS_PRIVATE_KEY` e `JWT_ACCESS_PUBLIC_KEY`

## 3. Gerar as chaves JWT

O backend usa JWT `RS256` com par PEM. Existem dois caminhos válidos.

### Opção A - gerar manualmente com OpenSSL

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Depois, converta os PEMs para uma linha só com `\\n`:

```bash
node -e "console.log(require('fs').readFileSync('private.pem','utf8').replace(/\\n/g,'\\\\n'))"
node -e "console.log(require('fs').readFileSync('public.pem','utf8').replace(/\\n/g,'\\\\n'))"
```

Cole o resultado em `back/.env`:

```env
JWT_ACCESS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
JWT_ACCESS_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
```

### Opção B - gerar arquivo de apoio para Docker

O repositório inclui:

```bash
node back/scripts/write-docker-jwt-env.mjs
```

Esse script escreve `.env.docker-jwt-test` com:

- `JWT_ACCESS_PRIVATE_KEY`
- `JWT_ACCESS_PUBLIC_KEY`

Você pode usar esse arquivo como base para preencher o `.env` da raiz quando o foco for Compose.

## 4. Configurar o `.env` da raiz para Docker Compose

O `docker-compose.yml` lê as chaves JWT da raiz do repositório, não de `back/.env`.

Crie ou atualize `.env` na raiz com:

```env
JWT_ACCESS_PRIVATE_KEY=...
JWT_ACCESS_PUBLIC_KEY=...
JWT_ISSUER=abp3-leads-api
JWT_AUDIENCE=abp3-leads-api
FRONTEND_ORIGINS=http://localhost:3000
```

Sem isso, o container do backend sobe e cai com erro de configuração do `AuthModule`.

## 5. Subir a stack

### Desenvolvimento com override

```bash
npm run dev
```

Esse comando usa:

- `docker-compose.yml`
- `docker-compose.dev.yml`

### Subida padrão mais estável

```bash
npm run compose:up
```

## 6. Aplicar migrations e seed

Se estiver usando a stack local da raiz:

```bash
npm run db:migrate
npm run db:seed
```

Observação:

- `prisma-migrate` do Compose já aplica migrations no container.
- o seed não roda automaticamente no `docker-compose.yml` atual.
- o seed precisa ser disparado manualmente.

## 7. Credenciais bootstrap

Hoje o seed cria pelo menos os seguintes usuários de suporte:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@crm.com` | `admin123` |
| Gerente Geral | `geral@crm.com` | `admin123` |

Origem: [dashboard-csv.seed.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/back/prisma/seeds/dashboard-csv.seed.ts)

## 8. Validar a autenticação

### Validação manual

1. Acesse `http://localhost:3000/login`
2. Entre com `admin@crm.com / admin123`
3. Confirme:
   - login concluído
   - redirecionamento para `/app/dashboard/analytic`
   - renderização do AppShell autenticado

### Validação por healthcheck

```bash
curl http://localhost:3001/api/health
```

### Validação de smoke da API

O backend já possui smoke script:

```bash
npm run smoke:http -w back
```

Quando aplicável, defina:

```bash
export SMOKE_ADMIN_EMAIL=admin@crm.com
export SMOKE_ADMIN_PASSWORD=admin123
```

## 9. Fluxos atuais relevantes

- `POST /api/auth/login`: funcional
- `POST /api/auth/logout`: funcional
- `POST /api/auth/refresh`: funcional
- `GET /api/auth/me`: funcional
- `/login`: funcional
- `/forgot-password`: informativo, sem recuperação automática
- `/register`: fora do fluxo público; criação pública não é suportada

## 10. Problemas comuns

### Backend sobe e cai com erro de JWT

Causa:

- `JWT_ACCESS_PRIVATE_KEY` e `JWT_ACCESS_PUBLIC_KEY` ausentes ou inválidos

Correção:

- preencher o `.env` da raiz e/ou `back/.env` com o par PEM em uma linha

### Login falha mesmo com a stack de pé

Causa provável:

- seed ainda não rodou

Correção:

```bash
npm run db:seed
```

### Prisma Studio conecta, mas emite erro de stream

Isso já apareceu com o Studio, mas não caracteriza necessariamente erro de banco ou schema. Trate primeiro como problema do tooling do Prisma Studio. O banco do projeto deve continuar acessível normalmente por:

- Prisma CLI
- migrations
- pgAdmin

### Vídeo do login não carrega no container

O `front/Dockerfile` atual já copia `front/public` para a imagem final. Se o vídeo não aparecer:

```bash
docker compose build front
docker compose up -d front
```

Depois, valide:

```text
http://localhost:3000/assets/login-wave.mp4
```

## 11. Checklist de bootstrap local

- [ ] Dependências instaladas com `npm install`
- [ ] `back/.env` criado a partir do exemplo
- [ ] `.env` da raiz criado com chaves JWT para o Compose
- [ ] Stack subiu com `npm run dev` ou `npm run compose:up`
- [ ] Migrations aplicadas
- [ ] Seed executado
- [ ] Login com `admin@crm.com / admin123` validado
- [ ] AppShell autenticado carregando após login
