# Arquitetura

## Objetivo

Consolidar a visão arquitetural da solução, registrar as decisões estruturais já adotadas e apontar os guias complementares que detalham como o projeto deve ser implementado e evoluído.

## Contexto

O projeto precisa atender ao escopo do ABP com uma base técnica organizada, mas também precisa permanecer sustentável caso o sistema cresça além do semestre. Por isso, a arquitetura foi pensada para equilibrar simplicidade operacional, separação de responsabilidades e espaço para evolução controlada.

## Direção adotada

- `single repository` com duas aplicações separadas: `front` e `back`;
- `front` em `Next.js`, focado em experiência web e consumo da API;
- `back` em `NestJS`, estruturado como `monólito modular`;
- backend organizado por `DDD` e `Clean Architecture`, com camadas explícitas por módulo;
- comunicação entre aplicações exclusivamente por `HTTP/JSON`.

## Visão da solução

| Parte | Responsabilidade |
| --- | --- |
| `front` | Experiência web, composição de telas, navegação e consumo da API |
| `back` | Contratos HTTP, autenticação, autorização, regras de negócio e integração com banco |
| `infra/db` | Material descontinuado de bootstrap SQL, fora da trilha oficial baseada em Prisma |
| `docs` | Rastreabilidade entre arquitetura, dados, API, qualidade e gestão |

Essa separação preserva fronteira clara entre apresentação e backend, evita acoplamento artificial e mantém a solução pronta para crescimento com disciplina.

## Padrão arquitetural do backend

No backend, a base adotada é:

- `Monólito Modular` como padrão estrutural;
- `DDD` como abordagem de modelagem do domínio;
- `Clean Architecture` como organização das camadas e dependências.

Essa combinação foi escolhida porque:

- favorece coesão por domínio;
- reduz acoplamento acidental;
- mantém controllers, persistência e regras de negócio em lugares distintos;
- melhora testabilidade;
- evita complexidade prematura de microserviços;
- cria uma base mais fácil de defender tecnicamente na banca e mais segura para evoluir.

## Guias complementares

Os detalhes da arquitetura foram divididos por assunto para evitar uma documentação única, extensa e genérica demais.

| Guia | Foco |
| --- | --- |
| [`next-frontend.md`](./next-frontend.md) | Estrutura e uso do frontend em Next.js |
| [`nest-backend.md`](./nest-backend.md) | Uso do NestJS no backend e integração com a arquitetura |
| [`ddd-clean-architecture.md`](./ddd-clean-architecture.md) | Princípios de DDD, Clean Architecture e regra de dependência |
| [`backend-module-structure.md`](./backend-module-structure.md) | Estrutura modular do backend e papel de cada camada |
| [`domain-building-blocks.md`](./domain-building-blocks.md) | Entities, Value Objects, eventos, repositórios e outros building blocks |
| [`backend-request-flow.md`](./backend-request-flow.md) | Fluxo de requisição, responsabilidades e passagem entre camadas |
| [`../diagrams/README.md`](../diagrams/README.md) | Catálogo de diagramas e links visuais do projeto |

## Diagramas catalogados neste momento

Os diagramas externos já classificados e referenciados para arquitetura são:

- `DG-CLS-01`: `Implementation Lead Management System`, diagrama de classes externo em `../diagrams/README.md`;
- `DG-CLS-02`: `Domain Lead Management System`, diagrama de classes externo em `../diagrams/README.md`.

## Módulos previstos

- `auth`
- `users`
- `teams`
- `stores`
- `customers`
- `leads`
- `negotiations`
- `dashboards`
- `audit-logs`

## Padrões de projeto que serão explicitados no projeto

| Padrão | Uso esperado |
| --- | --- |
| Repository | Abstração de acesso a dados e persistência |
| Service Layer | Encapsular casos de uso e regras transacionais |
| Factory | Criação de entidades e objetos de resposta complexos |
| Strategy | Regras variáveis de dashboard, filtros e autorização |
| Specification | Critérios de busca e filtros combináveis |

## Diretrizes técnicas

- Toda autorização será resolvida no backend.
- O frontend deve conversar com o backend apenas via contratos HTTP/JSON explícitos.
- Módulos devem conversar por contratos internos bem definidos.
- Regras de negócio não devem ficar em controllers, páginas ou componentes React.
- O backend não deve ter uma pasta global `src/infrastructure`; cada módulo implementa sua própria infraestrutura.
- Dependências compartilhadas devem ir para `shared` somente quando realmente forem transversais.
- `audit-logs` deve ser tratado como preocupação transversal, preferencialmente por eventos internos, middlewares ou serviços de auditoria centralizados.
- O `package.json` da raiz deve conter apenas tooling e scripts de orquestração do repositório único.

## Estratégia de crescimento e escala

O caminho arquitetural previsto é:

1. Evoluir primeiro com `front` e `back` separados, preservando fronteira estável entre experiência web e API.
2. Manter o `back` como `monólito modular`, com fronteiras de domínio claras e contratos internos bem definidos.
3. Escalar leitura analítica com boa modelagem relacional, índices e consultas sustentadas pela camada de persistência do backend.
4. Introduzir processamento assíncrono para tarefas pesadas, integrações ou consolidações por meio de jobs e filas.
5. Adicionar cache e read models específicos apenas onde o custo de consulta justificar.
6. Extrair serviços independentes somente se houver evidência operacional, de throughput ou de autonomia de times.

## Estratégia para dashboards e analytics

Como o domínio exige indicadores operacionais e analíticos, o backend foi pensado para não depender apenas de lógica em memória:

- consultas devem privilegiar agregações no PostgreSQL;
- filtros temporais devem ser validados no backend e refletidos na modelagem de consulta;
- índices devem ser adicionados de acordo com os acessos reais de leads, negociações, atendentes, equipes e datas;
- relatórios mais pesados podem evoluir para materializações, tabelas auxiliares ou processos assíncronos de consolidação;
- a API deve expor contratos claros para dashboards, sem espalhar regra analítica por múltiplos módulos sem coordenação;
- o frontend deve consumir indicadores prontos da API, sem reproduzir cálculos críticos no cliente.

## Próximos artefatos

- Diagrama de componentes
- Diagrama de classes
- Diagramas de sequência dos fluxos críticos
- Registro de decisões arquiteturais
