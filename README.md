# Sistema de Gestão de Leads com Dashboard Analítico

Repositório oficial da equipe `ErrorSquad-ABP` para o ABP 2026-1 do 3º DSM da FATEC Jacareí, desenvolvido para o parceiro `1000 Valle Multimarcas`.

## Contexto

| Item | Detalhe |
| --- | --- |
| Instituição | FATEC Jacareí |
| Curso | DSM - 3º semestre |
| Metodologia | ABP - Aprendizagem Baseada em Projetos |
| Parceiro | 1000 Valle Multimarcas |
| Contato | Leonardo Robles - `contato@atitudeti.com.br` |
| Focal point | Prof. Arley Ferreira de Souza |
| Kickoff | 19/03/2026 às 19h30 |
| Tema | Sistema de Gestão de Leads com Dashboard Analítico |

## Estado atual da `main`

O produto já entrega um incremento funcional do núcleo transacional:

- autenticação por e-mail e senha;
- `RBAC` aplicado no backend;
- perfil e atualização das próprias credenciais;
- gestão administrativa de utilizadores;
- gestão de lojas;
- gestão de equipas;
- gestão de clientes;
- CRUD operacional de leads com catálogos auxiliares;
- deploy de `front` e `back` na Vercel com banco Neon.

O que ainda não está fechado como produto:

- módulo funcional de negociações no frontend;
- dashboards operacionais e analíticos reais;
- logs administrativos como feature de produto;
- filtros temporais completos de analytics.

## Direcionadores arquiteturais

- Estratégia de solução: `single repository` com `front` e `back` separados.
- Backend: `NestJS` em `monólito modular` com organização em camadas.
- Frontend: `Next.js` com `App Router`, `React` e `TypeScript`.
- Comunicação entre aplicações exclusivamente por `HTTP/JSON`.
- Persistência com `PostgreSQL` e `Prisma ORM`.
- Regras de autorização aplicadas exclusivamente no backend.
- Quality gate com `Biome`, `ESLint` e `TypeScript`.
- Produção atual em `Vercel + Neon`.

## Stack

| Camada | Stack |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | NestJS 11, TypeScript, Prisma ORM |
| Banco | PostgreSQL |
| Qualidade | Biome, ESLint, TypeScript |
| Infra | Docker, Docker Compose, Vercel, Neon |

## Estrutura do repositório

```text
.
├── back/
├── docs/
├── front/
├── infra/
├── docker-compose.yml
├── docker-compose.dev.yml
├── eslint.config.cjs
├── biome.json
└── tsconfig.base.json
```

## Funcionalidades ativas

### Frontend

- `/login`
- `/forgot-password`
- `/app/profile`
- `/app/leads`
- `/app/customers`
- `/app/stores`
- `/app/teams`
- `/app/users`
- `/app/dashboard/operational` placeholder
- `/app/dashboard/analytic` placeholder

### Backend

- `/api/auth`
- `/api/users`
- `/api/teams`
- `/api/stores`
- `/api/customers`
- `/api/leads`

## Organização ágil

| Sprint | Período | Estado |
| --- | --- | --- |
| Sprint 1 | 24/03/2026 a 14/04/2026 | Encerrada |
| Sprint 2 | 15/04/2026 a 21/05/2026 | Planejamento em atualização |
| Sprint 3 | 22/05/2026 a 11/06/2026 | Não iniciada |

A Sprint 1 já foi encerrada. O resultado consolidado está em [docs/agile/sprint-1-review.md](./docs/agile/sprint-1-review.md).

## Fluxo de branches

- `main`: produção
- `develop`: integração
- `feat/*`, `fix/*`, `docs/*`, `refactor/*`, `chore/*`, `ci/*`, `build/*`, `style/*`, `perf/*`, `test/*`, `revert/*`: trabalho

Pull requests para `main` saem exclusivamente de `develop`, salvo contingência com bypass administrativo da liderança.

## Qualidade e segurança

Fluxo local obrigatório antes de PR:

1. `npm run format`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run lint:eslint`
5. `npm run build`

Gate bloqueante do repositório:

```bash
npm run quality:gate:blocking
```

## Subida local

O `docker compose` atual sobe apenas `front` e `back`. O banco é externo ao Compose e vem da `DATABASE_URL` em `back/.env`.

### Desenvolvimento

```bash
npm install
cp back/.env.example back/.env
npm run dev
```

### Produção atual

- Front: `https://abp3-sistema-gestao-leads-front.vercel.app`
- Back: `https://abp3-sistema-gestao-leads-back.vercel.app`
- Banco: Neon PostgreSQL

## Documentação

- [docs/README.md](./docs/README.md)
- [docs/architecture/README.md](./docs/architecture/README.md)
- [docs/architecture/frontend-information-architecture.md](./docs/architecture/frontend-information-architecture.md)
- [docs/api/README.md](./docs/api/README.md)
- [docs/auth/current-state.md](./docs/auth/current-state.md)
- [docs/agile/README.md](./docs/agile/README.md)
- [docs/runbooks/README.md](./docs/runbooks/README.md)
- [Wiki remota](https://github.com/ErrorSquad-ABP/ABP3-Sistema-Gestao-Leads/wiki)

## Próximas frentes naturais

1. Fechar Sprint 2 com recorte realista de negociações, dashboards e gaps restantes.
2. Consolidar dashboards como produto, não placeholder.
3. Fechar documentação final de cobertura ABP, incluindo DER/UML e matriz requisito x entrega.
