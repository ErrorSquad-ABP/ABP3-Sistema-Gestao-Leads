# Runbook - Setup Local

## Objetivo

Documentar o bootstrap local no estado atual da `main`.

## Pré-requisitos

- `Node.js >= 22`
- `npm >= 10`
- `Docker`
- `Docker Compose`
- acesso a um PostgreSQL válido, local ou remoto

## Topologia local atual

O projeto mantém dois modos locais:

- padrão do time: `front + back` usando o banco definido em `back/.env` (normalmente Neon dev);
- secundário de conformidade: `front + back + postgres` via `docker-compose.local.yml`.

O banco **não** faz parte do Compose padrão. O PostgreSQL local existe como opção secundária para uso externo, validação isolada e aderência ao edital.

## Portas

| Serviço | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:3001` |
| Health | `http://localhost:3001/api/health` |

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar ambiente do backend

```bash
cp back/.env.example back/.env
```

Preencher no mínimo:

- `DATABASE_URL`
- `JWT_ACCESS_PRIVATE_KEY`
- `JWT_ACCESS_PUBLIC_KEY`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `FRONTEND_ORIGINS=http://localhost:3000`

Observação:

- o time pode apontar `DATABASE_URL` tanto para um banco local quanto para a Neon de desenvolvimento;
- o Compose não cria nem reseta banco.

## 3. Subir a stack

### Desenvolvimento com hot reload

```bash
npm run dev
```

### Execução padrão

```bash
npm run compose:up
```

### Execução secundária com PostgreSQL local

```bash
npm run compose:local:up
```

Nesse modo:

- o PostgreSQL sobe em `localhost:5433`;
- um bootstrap local aplica `migrations` automaticamente;
- o seed roda automaticamente apenas se a base estiver vazia;
- o container `back` passa a usar `postgresql://abp:abp@postgres:5432/lead_management`;
- o `back/.env` continua existindo, mas `DATABASE_URL` é sobrescrita pelo override local.

## 4. Migrations

Quando houver migration nova:

```bash
npm run db:migrate
```

Como o banco não é parte do Compose, esse passo é explícito e consciente.

### Migration no PostgreSQL local secundário

```bash
npm run db:migrate:local
```

Observação:

- no `compose.local`, esse passo já é executado automaticamente pelo serviço `local-bootstrap` antes do `back` subir;
- o comando manual continua útil para reaplicar ou validar a base sem subir a stack inteira.

## 5. Seed

### Seed mínimo

```bash
npm run db:seed
```

### Seed analítico

```bash
SEED_MODE=dashboard npm run db:seed
```

### Seed no PostgreSQL local secundário

```bash
SEED_MODE=dashboard npm run db:seed:local
```

Observação:

- no `compose.local`, o seed só roda automaticamente quando a base local está vazia;
- se já existir utilizador na tabela `User`, o bootstrap local pula o seed para não sobrescrever a base.

## 6. Credenciais bootstrap

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@crm.com` | `admin123` |
| Gerente Geral | `geral@crm.com` | `admin123` |

## 7. Verificação mínima

### API

```bash
curl http://localhost:3001/api/health
```

### Front

1. Abrir `http://localhost:3000/login`
2. Entrar com `admin@crm.com / admin123`
3. Confirmar acesso a `/app/leads` e `/app/users`

### Smoke script

```bash
npm run smoke:http -w back
```

## 8. Problemas comuns

### `401` no login

Causas mais comuns:

- seed não executado;
- banco apontando para ambiente diferente do esperado;
- credenciais bootstrap ainda não existem naquela base.

### Backend cai no bootstrap

Verificar:

- `DATABASE_URL`
- chaves JWT
- `JWT_ISSUER`
- `JWT_AUDIENCE`

### `docker compose down -v` não limpa o banco

Isso agora é esperado. O Compose não sobe PostgreSQL local por padrão. O banco só muda se você:

- trocar a `DATABASE_URL`;
- rodar migrations;
- rodar seed;
- limpar a base externamente.

### Quero um banco local sem depender do remoto

Use o modo secundário:

```bash
npm run compose:local:up
```

Depois disso, o fluxo local fica totalmente independente do banco remoto. Se quiser forçar ciclo manual, ainda existem:

```bash
npm run db:migrate:local
SEED_MODE=dashboard npm run db:seed:local
```
