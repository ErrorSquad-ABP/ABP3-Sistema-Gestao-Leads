# DDD e Clean Architecture no Backend

## Objetivo

Explicar a base conceitual da arquitetura do backend, deixando claro como `DDD` e `Clean Architecture` são usados no projeto e por que essa escolha foi feita.

## Contexto

Este projeto lida com regras de negócio relevantes, controle de acesso por perfil, histórico de negociação, rastreabilidade e indicadores analíticos. Se essas responsabilidades ficarem misturadas com transporte HTTP ou persistência, o backend tende a perder clareza e previsibilidade rapidamente.

## Problema que a arquitetura resolve

Sem uma arquitetura explícita, o sistema tende a sofrer com:

- regra de negócio espalhada;
- controllers concentrando lógica demais;
- acoplamento entre domínio e banco;
- dificuldade para testar fluxos críticos;
- baixa previsibilidade quando o sistema cresce.

A combinação de `DDD` com `Clean Architecture` existe para reduzir esse risco desde a fundação do projeto.

## O papel do DDD

`DDD` orienta o backend a ser construído em torno do domínio do negócio, e não em torno do framework, do banco ou do protocolo HTTP.

Na prática, isso significa:

- modelar o sistema por contextos de negócio;
- tratar o módulo como unidade real de domínio;
- dar comportamento às entidades, em vez de trabalhar apenas com estruturas de dados anêmicas;
- usar objetos de domínio para representar valores que possuem regra própria;
- manter a linguagem do código próxima da linguagem do negócio.

## O papel da Clean Architecture

`Clean Architecture` organiza o sistema em camadas com responsabilidades distintas e dependências controladas.

A regra central é:

- camadas internas não devem depender de camadas externas.

No backend deste projeto, isso significa que:

- o domínio não conhece HTTP;
- o domínio não conhece NestJS;
- o domínio não conhece SQL, ORM ou implementação de banco;
- controllers não devem carregar regra de negócio;
- infraestrutura implementa contratos definidos pelas camadas internas.

## Camadas adotadas

| Camada | Responsabilidade |
| --- | --- |
| `domain` | Regras de negócio puras, entidades, value objects, contratos e invariantes |
| `application` | Casos de uso, orquestração de fluxo e coordenação entre dependências |
| `infrastructure` | Implementações concretas de persistência, gateways e integrações |
| `presentation` | Entrada e saída HTTP, controllers, DTOs de transporte e adaptação do protocolo |

## Regra de dependência

O fluxo de dependência esperado é:

`presentation -> application -> domain`

e

`infrastructure -> domain` ou `infrastructure -> application`, quando estiver implementando contratos definidos internamente.

O que não deve acontecer:

- `domain` importando classes de `presentation`;
- `domain` dependendo de NestJS;
- `application` executando SQL diretamente;
- `presentation` decidindo regra de autorização ou consistência de domínio por conta própria.

## Como isso se traduz no projeto

Cada módulo do backend deve ser tratado como um contexto coeso, contendo:

- modelagem de domínio;
- casos de uso;
- infraestrutura necessária;
- adaptação HTTP.

Esse desenho ajuda a manter:

- alta coesão dentro do módulo;
- baixo acoplamento entre módulos;
- clareza para testes;
- evolução incremental sem reescrever a base.

## Impactos e implicações

- O backend fica mais verboso do que uma estrutura “controller + service + repository” simples.
- Em troca, a regra de negócio fica mais estável e mais fácil de localizar.
- O custo inicial de organização é maior, mas o custo de manutenção tende a cair ao longo das sprints.
- A arquitetura fica mais adequada para um sistema que precisa crescer sem virar um conjunto de endpoints acoplados.

## Próximos passos

1. Consolidar essa abordagem nos primeiros módulos reais do domínio.
2. Explicitar os principais padrões de projeto usados em cada módulo.
3. Relacionar essas decisões com os futuros diagramas de componentes e sequência.
