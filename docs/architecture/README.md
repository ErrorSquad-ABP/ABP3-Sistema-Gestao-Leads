# Arquitetura

## Padrão arquitetural adotado

O projeto parte de um `Monólito Modular` com `Arquitetura em Camadas`.

Essa combinação atende diretamente às restrições do ABP:

- facilita a separação entre frontend e backend;
- mantém baixa complexidade operacional no início do semestre;
- favorece coesão por domínio e reduz acoplamento acidental;
- simplifica testes, versionamento e conteinerização;
- deixa margem para extração futura de serviços, caso o crescimento do sistema justifique.

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

## Próximos artefatos

- Diagrama de componentes
- Diagrama de classes
- Diagramas de sequência dos fluxos críticos
- Registro de decisões arquiteturais
