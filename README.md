# Sistema de Gestão de Leads com Dashboard Analítico

Repositório oficial da equipe `ErrorSquad-ABP` para o ABP 2026-1 do 3º DSM da FATEC Jacareí, desenvolvido para o parceiro `1000 Valle Multimarcas`.

## Contexto do projeto

| Item | Detalhe |
| --- | --- |
| Instituição | Faculdade de Tecnologia Professor Francisco de Moura - FATEC Jacareí |
| Curso | DSM - 3º semestre |
| Metodologia | ABP - Aprendizagem Baseada em Projetos |
| Parceiro | 1000 Valle Multimarcas |
| Contato do parceiro | Leonardo Robles - contato@atitudeti.com.br |
| Focal point | Prof. Arley Ferreira de Souza |
| Kickoff | 19/03/2026 às 19h30 |
| Tema do semestre | Sistema de Gestão de Leads com Dashboard Analítico |

## Visão inicial

O desafio consiste em desenvolver, do zero, um sistema web para gestão de leads comerciais de uma revendedora de veículos com múltiplas unidades. O produto deverá centralizar o cadastro de leads, sua associação a clientes, lojas e atendentes, a evolução da negociação e a geração de indicadores operacionais e analíticos para diferentes níveis de gestão.

Este repositório nasce como um `monorepo` orientado a `monólito modular`, mantendo frontend e backend separados por responsabilidade, mas versionados no mesmo lugar para simplificar governança, padronização técnica e entregas incrementais ao longo das sprints.

## Direcionadores arquiteturais

- Padrão arquitetural principal: `Monólito Modular` com `Arquitetura em Camadas`.
- Separação macro: `front` para apresentação e `back` para API REST.
- Módulos de negócio planejados: `auth`, `users`, `teams`, `stores`, `customers`, `leads`, `negotiations`, `dashboards` e `audit-logs`.
- Regras de autorização centralizadas exclusivamente no backend, conforme o enunciado.
- Estrutura preparada para PostgreSQL, Docker Compose, quality gate com Biome, ESLint e TypeScript.

## Stack base

| Camada | Stack |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + TypeScript + Express |
| Banco de dados | PostgreSQL |
| Qualidade | Biome, ESLint, TypeScript Checker |
| Segurança | JWT, hashing seguro, lint de segurança, Snyk para VS Code |
| Infraestrutura | Docker, Docker Compose, GitHub Actions |

## Estrutura inicial do repositório

```text
.
├── .github/                # Templates e workflows
├── .vscode/                # Recomendacoes e padroes de editor
├── back/                   # API REST em Node.js + TypeScript
├── docs/                   # Artefatos de arquitetura, dados, API e agilidade
├── front/                  # Aplicacao React + TypeScript
├── infra/                  # Scripts e bootstrap de infraestrutura
├── biome.json              # Formatacao e lint baseline
├── eslint.config.cjs       # ESLint v9+ flat config
├── docker-compose.yml      # Orquestracao local padrao
└── tsconfig.base.json      # Configuracao TS compartilhada
```

## Time do projeto

### Papéis definidos

| Pessoa | GitHub | Papel |
| --- | --- | --- |
| João Victor Lopes Rosa | `@JV-L0pes` | Scrum Master e Responsável Técnico |
| Leonardo da Silva Irineu | `@Leo-Slv` | Product Owner e Tech Lead |

### Membros da organização

| Pessoa | GitHub | Atuação inicial |
| --- | --- | --- |
| Arthur Facchinetti | `@ArtFacchinetti` | Time de desenvolvimento |
| Arthur Facchinetti | `@ArthurFacchinetti` | Time de desenvolvimento |
| Caiuuutecnologico | `@Caiuuutecnologico` | Time de desenvolvimento |
| Carlos Santo | `@Carlos-Santo` | Time de desenvolvimento |
| Felipe Pacheco | `@FelipePacheco30` | Time de desenvolvimento |
| João Victor Lopes Rosa | `@JV-L0pes` | Liderança técnica e facilitação |
| Leonardo da Silva Irineu | `@Leo-Slv` | Produto e liderança técnica |

## Organização ágil

| Sprint | Período |
| --- | --- |
| Sprint 1 | 24/03/2026 a 14/04/2026 |
| Sprint 2 | 15/04/2026 a 21/05/2026 |
| Sprint 3 | 22/05/2026 a 11/06/2026 |
| Apresentação final | Semana de 22/07/2026 |

Artefatos iniciais de acompanhamento já estão previstos em [`docs/agile/README.md`](./docs/agile/README.md), incluindo backlog, Definition of Done e visão das sprints.

## Qualidade e segurança

- Formatação, lint e checks de consistência com `Biome`.
- Qualidade estática com `ESLint` para TypeScript, React e regras de segurança.
- Configuração oficial de ESLint centralizada em `eslint.config.cjs` (flat config do ESLint v9).
- Gate de tipos com `tsc --noEmit`.
- Recomendação de extensão `Snyk` no VS Code para análise de vulnerabilidades em tempo de desenvolvimento.
- Workflows de CI para qualidade e para enforcement do fluxo `develop -> main`.

## Fluxo de branches

- `main`: branch estável, protegida para releases.
- `develop`: branch de integração contínua da equipe.
- `feature/*`, `fix/*`, `refactor/*`, `chore/*`: branches de trabalho.

Pull requests para `main` devem sair exclusivamente de `develop`.
O repositório inclui template de PR, workflow para recusar PRs inválidos automaticamente e proteção de branch para concentrar aprovação e merge da `main` na liderança técnica definida do projeto.

## Documentação complementar

- [`docs/README.md`](./docs/README.md)
- [`docs/architecture/README.md`](./docs/architecture/README.md)
- [`docs/api/README.md`](./docs/api/README.md)
- [`docs/data/README.md`](./docs/data/README.md)
- [`docs/agile/README.md`](./docs/agile/README.md)
- [`front/README.md`](./front/README.md)
- [`back/README.md`](./back/README.md)

## Como subir o esqueleto inicial

1. Instale `Docker` e `Docker Compose`.
2. Clone o repositório.
3. Execute `docker compose up --build`.
4. Acesse o frontend em `http://localhost:5173`, a API em `http://localhost:3000/health` e o PostgreSQL no host em `localhost:5433`.

## Próximos passos sugeridos

1. Refinar o modelo de dados oficial e validar o DER com o parceiro.
2. Detalhar casos de uso, classes, componentes e sequência em `docs/`.
3. Priorizar backlog da Sprint 1 e iniciar implementação dos módulos `auth`, `users` e `leads`.
4. Definir estratégia de autenticação, autorização RBAC e histórico de negociação no backend.
