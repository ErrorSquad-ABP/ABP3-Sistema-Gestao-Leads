# Arquitetura

## Padrão arquitetural adotado

O projeto parte de um `Monólito Modular` com `Arquitetura em Camadas`.

Essa combinação atende diretamente às restrições do ABP:

- facilita a separação entre frontend e backend;
- mantém baixa complexidade operacional no início do semestre;
- favorece coesão por domínio e reduz acoplamento acidental;
- simplifica testes, versionamento e conteinerização;
- deixa margem para extração futura de serviços, caso o crescimento do sistema justifique.

Ela também foi escolhida para sustentar evolução real do produto, não apenas para cumprir o semestre. A intenção é crescer com disciplina modular, preservar clareza arquitetural e adiar aumento de complexidade operacional até que exista justificativa concreta.

## Visão de alto nível

### Frontend

- Camada de apresentação em React.
- Organização por módulos de negócio e compartilhamento por `shared`.
- Consumo exclusivo da API REST.

### Backend

- `controllers`: entrada HTTP e validação de contrato.
- `services`: orquestração de casos de uso e regras de negócio.
- `repositories`: acesso a dados.
- `domain`: entidades, enums, value objects e políticas centrais.
- `shared`: componentes transversais realmente reutilizáveis, sem virar depósito genérico.

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
- Módulos devem conversar por contratos internos bem definidos.
- Regras de negócio não devem ficar em controllers nem em componentes React.
- Dependências compartilhadas devem ir para `shared` somente quando realmente forem transversais.
- `audit-logs` deve ser tratado como preocupação transversal, preferencialmente por eventos internos, middlewares ou serviços de auditoria centralizados.
- O `package.json` da raiz deve conter apenas tooling e scripts de orquestração do repositório único.

## Estratégia de crescimento e escala

O caminho arquitetural previsto é:

1. Evoluir primeiro como `monólito modular`, com fronteiras de domínio claras.
2. Escalar leitura analítica com SQL bem escrita, índices, views e materialized views quando necessário.
3. Introduzir processamento assíncrono para tarefas pesadas, integrações ou consolidações por meio de jobs e filas.
4. Adicionar cache e read models específicos apenas onde o custo de consulta justificar.
5. Extrair serviços independentes somente se houver evidência operacional, de throughput ou de autonomia de times.

Essa abordagem evita complexidade prematura e mantém o sistema pronto para crescer de forma controlada.

## Estratégia para dashboards e analytics

Como o domínio exige indicadores operacionais e analíticos, o backend foi pensado para não depender apenas de lógica em memória:

- consultas devem privilegiar agregações no PostgreSQL;
- filtros temporais devem ser validados no backend e refletidos na modelagem de consulta;
- índices devem ser adicionados de acordo com os acessos reais de leads, negociações, atendentes, equipes e datas;
- relatórios mais pesados podem evoluir para materializações, tabelas auxiliares ou processos assíncronos de consolidação;
- a API deve expor contratos claros para dashboards, sem espalhar regra analítica por múltiplos módulos sem coordenação.

## Próximos artefatos

- Diagrama de componentes
- Diagrama de classes
- Diagramas de sequência dos fluxos críticos
- Registro de decisões arquiteturais
