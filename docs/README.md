# Documentação do Projeto

Este diretório concentra os artefatos de apoio técnico, analítico e de gestão do projeto. A proposta é manter tudo versionado junto com o código para reduzir dispersão de conhecimento e facilitar rastreabilidade entre requisito, arquitetura, backlog e entrega.

A **Wiki do GitHub** ([repositório](https://github.com/ErrorSquad-ABP/ABP3-Sistema-Gestao-Leads/wiki)) deve manter espelhamento 1:1 destes artefatos versionados. A fonte primária continua sendo o repositório (`docs/`); **não** existe pasta `wiki/` local — a Wiki é só no remoto.

## Estrutura

- `architecture/`: decisões arquiteturais, padrões adotados e diagramas.
- `diagrams/`: catálogo de diagramas, referências visuais e links externos versionados na documentação.
- `api/`: convenções, contratos e inventário de endpoints.
- `data/`: modelo de dados, DER, dicionário e estratégia de persistência orientada a Prisma.
- `agile/`: backlog, cerimônias, Definition of Done, retrospectivas e planejamento de sprints.
- `quality/`: fluxo de validação, critérios de CI e convenções de revisão técnica.
- `runbooks/`: setup local, bootstrap operacional e procedimentos de subida da stack.
- `auth/`: estado atual de autenticação, sessão e autorização.
- `templates/`: modelos de documentação para manter consistência entre novos arquivos Markdown.

## Entregáveis previstos

| Artefato | Local |
| --- | --- |
| Visão geral do produto | `../README.md` |
| Descrição da arquitetura adotada | `architecture/README.md` |
| Guia do frontend em Next.js | `architecture/next-frontend.md` |
| Plano de implementação, IA e UX do frontend | `architecture/frontend-information-architecture.md` |
| Guia do backend em NestJS | `architecture/nest-backend.md` |
| DDD e Clean Architecture no backend | `architecture/ddd-clean-architecture.md` |
| Estrutura modular do backend | `architecture/backend-module-structure.md` |
| Building blocks de domínio | `architecture/domain-building-blocks.md` |
| Fluxo de requisição no backend | `architecture/backend-request-flow.md` |
| Catálogo de diagramas | `diagrams/README.md` |
| Padrões de projeto utilizados | `architecture/README.md` |
| Descrição de endpoints e contratos | `api/README.md` |
| Modelo relacional e DER | `data/README.md` |
| Definition of Done | `agile/definition-of-done.md` |
| Product backlog inicial | `agile/product-backlog.md` |
| Backlog operacional de implementação do frontend | `agile/frontend-implementation-backlog.md` |
| Sprint 1 Goal | `agile/sprint-1-goal.md` |
| Sprint 1 Backlog | `agile/sprint-1-backlog.md` |
| Quebra detalhada das tarefas da Sprint 1 | `agile/sprint-1-task-breakdown.md` |
| Sprint 1 Planning | `agile/sprint-1-planning.md` |
| Sprints e cadência | `agile/sprints.md` |
| Fluxo de qualidade e revisão | `quality/README.md` |
| Runbooks operacionais | `runbooks/README.md` |
| Estado atual de auth e RBAC | `auth/current-state.md` |

## Princípios de documentação

- Documentar decisões e não apenas resultados.
- Evitar material solto fora do repositório.
- Manter uma trilha clara entre requisito, regra de negócio e implementação.
- Atualizar a documentação como parte da Definition of Done.
- Reutilizar os templates de `templates/` sempre que uma nova documentação estrutural for criada.

## Padrão editorial adotado

Os documentos principais do projeto seguem a mesma linha editorial:

- abertura curta explicando objetivo e contexto do arquivo;
- seções com nomes diretos e previsíveis;
- listas objetivas para diretrizes, regras e decisões;
- tabelas quando ajudam a condensar papéis, stacks ou entregáveis;
- fechamento com próximos passos, evolução esperada ou artefatos futuros quando aplicável.

Esse padrão agora está formalizado em `templates/`, para evitar que a documentação futura perca consistência.
