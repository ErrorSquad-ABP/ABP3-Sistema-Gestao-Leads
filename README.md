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

Este repositório nasce como um `single repository` com duas aplicações separadas por responsabilidade: `front` em `Next.js` para a experiência web e `back` em `NestJS` para a API. As duas aplicações se comunicam via `HTTP/JSON`, enquanto o backend preserva organização interna de `monólito modular` para sustentar crescimento com clareza de domínio e baixo acoplamento.

## Direcionadores arquiteturais

- Estratégia de solução: `single repository` com `front` e `back` separados.
- Padrão arquitetural interno do backend: `Monólito Modular` com `Arquitetura em Camadas`.
- Separação macro: `front` como aplicação web em Next.js e `back` como API em NestJS.
- Comunicação entre aplicações exclusivamente por `HTTP/JSON`.
- NestJS adotado no backend por reforçar modularidade, injeção de dependência, uso de decorators e fronteiras explícitas entre camadas.
- Módulos de negócio planejados: `auth`, `users`, `teams`, `stores`, `customers`, `leads`, `negotiations`, `dashboards` e `audit-logs`.
- Regras de autorização centralizadas exclusivamente no backend, conforme o enunciado.
- Estrutura preparada para PostgreSQL, Docker Compose, quality gate com Biome, ESLint e TypeScript.
- Base desenhada para crescer além do ABP, preservando evolução incremental sem forçar microserviços cedo demais.

## Stack base

| Camada | Stack |
| --- | --- |
| Frontend | Next.js + React + TypeScript |
| Backend | NestJS + TypeScript |
| Banco de dados | PostgreSQL |
| Qualidade | Biome, ESLint, TypeScript Checker |
| Segurança | JWT, hashing seguro, lint de segurança, Snyk para VS Code |
| Infraestrutura | Docker, Docker Compose, GitHub Actions |

## Estrutura inicial do repositório

```text
.
├── .github/                # Templates e workflows
├── .vscode/                # Recomendacoes e padroes de editor
├── back/                   # API em NestJS + TypeScript
├── docs/                   # Artefatos de arquitetura, dados, API e agilidade
├── front/                  # Aplicacao web em Next.js + TypeScript
├── infra/                  # Scripts e bootstrap de infraestrutura
├── biome.json              # Formatacao e lint baseline
├── eslint.config.cjs       # ESLint v9+ flat config
├── docker-compose.yml      # Orquestracao local padrao
└── tsconfig.base.json      # Configuracao TS compartilhada
```

## Escalabilidade e evolução

A arquitetura base não foi desenhada apenas para cumprir o enunciado do semestre. Ela foi montada para permitir crescimento progressivo do produto sem recomeçar a base técnica quando o sistema ficar maior.

Os princípios para essa evolução são:

- separar `front` e `back` desde a base para manter fronteira HTTP clara e permitir evolução independente de cada aplicação;
- manter o backend como `monólito modular` para ganhar velocidade, coesão de domínio e simplicidade operacional;
- isolar módulos de negócio desde o início para reduzir acoplamento e facilitar manutenção;
- concentrar regras críticas no backend para preservar segurança, auditoria e rastreabilidade;
- preparar o backend para consultas analíticas mais exigentes com boa modelagem SQL, índices, agregações e materializações quando necessário;
- permitir a introdução futura de filas, jobs assíncronos, cache e read models sem ruptura da base principal;
- deixar extração para serviços separados apenas como decisão futura, orientada por necessidade real de escala, não por modismo arquitetural.

Em outras palavras: a base atual é enxuta para o semestre, mas não é descartável nem um beco sem saída.

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

### Política de workspaces

O `package.json` da raiz existe para `tooling`, scripts de orquestração e padronização do repositório único. Dependências de aplicação não devem ser instaladas nele.

Padrão esperado:

- frontend: `npm i <pacote> -w front`
- backend: `npm i <pacote> -w back`

O CI valida essa regra automaticamente com `npm run guard:root-package`, impedindo que dependências de runtime sejam adicionadas por engano na raiz.
### Fluxo obrigatório de validação local

Antes de abrir PR, o fluxo esperado da equipe é:

1. `npm run format`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run lint:eslint`
5. `npm run build`

No CI, os equivalentes em modo de verificação são executados automaticamente para bloquear merges com código fora do padrão:

1. `npm run guard:root-package`
2. `npm run format:check`
3. `npm run lint:check`
4. `npm run typecheck`
5. `npm run lint:eslint`
6. `npm run build`

Observação: o `Snyk` permanece como ferramenta de apoio no editor via extensão do VS Code, não como etapa do GitHub Actions neste momento.

## Fluxo de branches

- `main`: branch estável, protegida para releases.
- `develop`: branch de integração contínua da equipe.
- `feature/*`, `fix/*`, `refactor/*`, `chore/*`: branches de trabalho.

Pull requests para `main` devem sair exclusivamente de `develop`.
O repositório inclui template de PR, workflow para recusar PRs inválidos automaticamente e proteção de branch para concentrar aprovação e merge da `main` na liderança técnica definida do projeto.
Na operação cotidiana, a equipe deve tratar a `main` como branch exclusiva de integração final por PR. Exceções operacionais de bypass existem apenas para `@JV-L0pes` e `@Leo-Slv`, com finalidade de liderança e contingência, não como fluxo padrão de desenvolvimento.

## Documentação complementar

- [`docs/README.md`](./docs/README.md)
- [`docs/architecture/README.md`](./docs/architecture/README.md)
- [`docs/architecture/next-frontend.md`](./docs/architecture/next-frontend.md)
- [`docs/architecture/nest-backend.md`](./docs/architecture/nest-backend.md)
- [`docs/api/README.md`](./docs/api/README.md)
- [`docs/data/README.md`](./docs/data/README.md)
- [`docs/agile/README.md`](./docs/agile/README.md)
- [`docs/quality/README.md`](./docs/quality/README.md)
- [`front/README.md`](./front/README.md)
- [`back/README.md`](./back/README.md)

## Como subir o esqueleto inicial

1. Instale `Docker` e `Docker Compose`.
2. Clone o repositório.
3. Execute `docker compose up --build`.
4. Acesse o frontend em `http://localhost:3000`, a API em `http://localhost:3001/api/health` e o PostgreSQL no host em `localhost:5433`.

## Próximos passos sugeridos

1. Refinar o modelo de dados oficial e validar o DER com o parceiro.
2. Detalhar casos de uso, classes, componentes e sequência em `docs/`.
3. Priorizar backlog da Sprint 1 e iniciar implementação dos módulos `auth`, `users` e `leads`.
4. Definir estratégia de autenticação, autorização RBAC e histórico de negociação no backend.
