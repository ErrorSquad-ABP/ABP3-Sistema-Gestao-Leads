# Arquitetura

## Visão arquitetural da solução

O projeto adota `single repository` com duas aplicações separadas:

- `front`: aplicação web em `Next.js` responsável pela experiência do usuário;
- `back`: aplicação de API em `NestJS` responsável por contratos HTTP, regras de negócio, segurança e integração com banco.

As duas aplicações se comunicam exclusivamente por `HTTP/JSON`. Essa escolha preserva fronteira clara entre apresentação e backend, favorece deploy independente no futuro e mantém a solução preparada para crescimento sem acoplamento artificial entre camadas.

## Padrão arquitetural do backend

No backend, o padrão adotado continua sendo `Monólito Modular` com `Arquitetura em Camadas`.

Essa combinação atende diretamente às restrições do ABP e ao objetivo de escalar com disciplina:

- mantém baixa complexidade operacional no início do semestre;
- favorece coesão por domínio e reduz acoplamento acidental;
- simplifica testes, versionamento e conteinerização;
- deixa margem para extração futura de serviços, caso o crescimento do sistema justifique;
- preserva clareza entre transporte HTTP, aplicação, domínio e persistência.

## Visão de alto nível

### Front

- App Router do Next.js para páginas, layouts e composição da experiência web.
- Organização por módulos de negócio e compartilhamento por `shared`.
- Consumo exclusivo da API separada, sem acesso direto ao banco.

Guia complementar:

- [`next-frontend.md`](./next-frontend.md)

### Back

- `controllers`: adaptação HTTP via decorators e controllers do Nest.
- `application` ou `services`: orquestração de casos de uso e regras de negócio.
- `domain`: entidades, enums, value objects e políticas centrais.
- `infrastructure`: implementação concreta por módulo.
- `shared`: componentes transversais realmente reutilizáveis, sem virar depósito genérico.

## Adoção do NestJS no backend

O backend foi migrado para `NestJS` porque a equipe quer reforçar modularidade, baixo acoplamento e organização por domínio. O framework se encaixa bem nessa proposta por combinar:

- módulos explícitos;
- decorators para transporte HTTP;
- injeção de dependência nativa;
- composição por providers;
- clareza entre controller, serviço, módulo e infraestrutura.

Guia complementar:

- [`nest-backend.md`](./nest-backend.md)

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
3. Escalar leitura analítica com SQL bem escrita, índices, views e materialized views quando necessário.
4. Introduzir processamento assíncrono para tarefas pesadas, integrações ou consolidações por meio de jobs e filas.
5. Adicionar cache e read models específicos apenas onde o custo de consulta justificar.
6. Extrair serviços independentes somente se houver evidência operacional, de throughput ou de autonomia de times.

Essa abordagem evita complexidade prematura e mantém o sistema pronto para crescer de forma controlada.

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
