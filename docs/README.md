# Documentação do Projeto

Este diretório concentra a documentação viva do repositório. A fonte primária é sempre o conteúdo versionado aqui; a Wiki remota deve espelhar este estado, sem competir com ele.

## Estrutura

- `architecture/`: decisões arquiteturais e organização técnica.
- `api/`: contratos e inventário real de endpoints.
- `auth/`: estado atual de autenticação, sessão e RBAC.
- `data/`: modelo relacional e estratégia de persistência.
- `agile/`: backlog, planning, review e governança das sprints.
- `quality/`: fluxo de validação, CI e revisão.
- `runbooks/`: setup local, deploy e operação.

## Fonte de verdade

- código: repositório
- documentação: `docs/`
- wiki: espelho remoto de `docs/`

## Entregáveis relevantes hoje

| Artefato | Local |
| --- | --- |
| Visão geral do projeto | `../README.md` |
| Arquitetura | `architecture/README.md` |
| Plano e estado do frontend | `architecture/frontend-information-architecture.md` |
| API real | `api/README.md` |
| Auth e RBAC | `auth/current-state.md` |
| Modelo de dados | `data/README.md` |
| Governança ágil | `agile/README.md` |
| Runbooks | `runbooks/README.md` |
| Fluxo de qualidade | `quality/README.md` |

## Estado atual

No estado atual da `main`, a documentação precisa refletir:

- Compose local sem banco embarcado;
- deploy real em `Vercel + Neon`;
- autenticação híbrida com cookie HttpOnly e `Bearer`;
- módulo transacional ativo em `users`, `stores`, `teams`, `customers` e `leads`;
- dashboards ainda como placeholder;
- Sprint 1 encerrada e Sprint 2 ainda em definição.
