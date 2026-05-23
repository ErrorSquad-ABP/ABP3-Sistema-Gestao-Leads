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

## Estado atual da `develop`

O produto já entrega o incremento funcional principal do `Quantum CRM`:

- autenticação por e-mail e senha;
- `RBAC` aplicado no backend;
- perfil e atualização das próprias credenciais;
- gestão administrativa de utilizadores;
- gestão de lojas;
- gestão de equipas;
- gestão de clientes;
- CRUD operacional de leads com catálogos auxiliares;
- detalhe operacional do lead com timeline;
- gestão de veículos `end-to-end`;
- gestão de negociações `end-to-end`;
- dashboards operacional e analítico com dados reais;
- filtros temporais com validação no backend;
- identidade visual própria do `Quantum CRM`;
- base técnica de audit log para fechamento completo na Sprint 3;
- deploy de `front` e `back` na Vercel com banco Neon.

Frentes remanescentes para a Sprint 3:

- refinamento visual fino para apresentação final;
- melhoria incremental de qualidade de código;
- audit log completo como feature administrativa final.

## Direcionadores arquiteturais

- Estratégia de solução: `single repository` com `front` e `back` separados.
- Backend: `NestJS` em `monólito modular` com organização em camadas.
- Frontend: `Next.js` com `App Router`, `React` e `TypeScript`.
- Comunicação entre aplicações exclusivamente por `HTTP/JSON`.
- Persistência com `PostgreSQL` e `Prisma ORM`.
- Regras de autorização aplicadas exclusivamente no backend.
- Quality gate com `Biome`, `ESLint` e `TypeScript`.
- Produção atual em `Vercel + Neon`.
- Quatro modos de subida local documentados (Docker/native × banco remoto/local).

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
├── docker-compose.postgres.yml
├── docker-compose.local.yml
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
- `/app/leads/[id]`
- `/app/customers`
- `/app/stores`
- `/app/teams`
- `/app/users`
- `/app/vehicles`
- `/app/deals`
- `/app/dashboard/operational`
- `/app/dashboard/analytic`

### Backend

- `/api/auth`
- `/api/users`
- `/api/teams`
- `/api/stores`
- `/api/customers`
- `/api/leads`
- `/api/deals`
- `/api/vehicles`
- `/api/dashboards/operational`
- `/api/dashboards/analytic`

## Organização ágil

| Sprint | Período | Estado |
| --- | --- | --- |
| Sprint 1 | 24/03/2026 a 14/04/2026 | Encerrada |
| Sprint 2 | 15/04/2026 a 21/05/2026 | Encerrada documentalmente em 20/05/2026 |
| Sprint 3 | 22/05/2026 a 11/06/2026 | Foco definido |

A Sprint 1 já foi encerrada. O resultado consolidado está em [docs/agile/sprint-1-review.md](./docs/agile/sprint-1-review.md).

A Sprint 2 também possui fechamento consolidado em [docs/agile/sprint-2-review.md](./docs/agile/sprint-2-review.md) e retrospective em [docs/agile/sprint-2-retrospective.md](./docs/agile/sprint-2-retrospective.md).

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

Quatro modos oficiais (escolha **um**). Detalhes em [docs/runbooks/local-setup.md](./docs/runbooks/local-setup.md).

| Comando | Docker | Banco |
| --- | --- | --- |
| `npm run start:docker:remote` | Sim | Neon / `back/.env` |
| `npm run start:docker:local` | Sim | Postgres no Compose |
| `npm run start:native:remote` | Não | Neon / `back/.env` |
| `npm run start:native:local` | Não | `localhost:5433` |

Windows sem Docker Desktop: [docs/runbooks/setup-windows.md](./docs/runbooks/setup-windows.md).

### Início rápido (Docker + banco remoto)

```bash
npm install
cp back/.env.example back/.env
# Preencher DATABASE_URL (Neon), JWT e FRONTEND_ORIGINS
npm run start:docker:remote
```

### Início rápido (sem Docker — PCs da faculdade)

```bash
npm install
cp back/.env.example back/.env
cp front/.env.example front/.env
npm run db:migrate && npm run db:seed
npm run start:native:remote
```

Aliases: `npm run dev` = `start:docker:remote`, `npm run dev:local` = `start:docker:local`.

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

1. Refinar visualmente o produto para apresentação final.
2. Melhorar qualidade de código e consistência entre módulos entregues.
3. Fechar audit log completo e documentação final de cobertura ABP.
