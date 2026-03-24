# Building Blocks de Domínio

## Objetivo

Definir os principais elementos de modelagem de domínio que poderão aparecer nos módulos do backend e esclarecer quando cada um deles deve ser usado.

## Contexto

Nem todo módulo começa complexo, mas a arquitetura precisa ter linguagem e estrutura para representar regras importantes quando elas surgirem. Este documento existe para alinhar a equipe sobre como pensar o domínio antes de cair em implementações apressadas.

## Entidades

Entidade é um objeto com identidade própria e ciclo de vida.

Ela deve ser usada quando:

- o objeto precisa de identificador estável;
- o estado pode mudar ao longo do tempo;
- existe comportamento associado à sua existência.

Responsabilidades esperadas:

- proteger invariantes;
- controlar transições válidas;
- encapsular comportamento relevante de negócio.

Não deve ser tratada como:

- estrutura de dados solta;
- espelho direto da tabela;
- DTO de entrada.

## Aggregate Root

Quando um conjunto de objetos de domínio precisa preservar consistência sob uma única fronteira transacional, a entidade principal pode atuar como `aggregate root`.

Essa decisão deve aparecer quando:

- múltiplos objetos dependem de uma mesma regra central;
- o acesso externo deve ser controlado por um ponto único;
- o módulo precisa evitar atualizações inconsistentes em partes relacionadas do domínio.

Nem todo módulo precisa começar com aggregates complexos. A equipe deve introduzi-los quando houver regra suficiente para justificar.

## Value Objects

Value Object representa um valor com regra própria.

Ele deve ser usado quando:

- um campo simples carrega regra de validação;
- o valor precisa de semântica mais rica que `string`, `number` ou `boolean`;
- a comparação correta depende do valor, não de identidade.

Exemplos comuns:

- email;
- nome;
- período;
- faixa de importância;
- status com regra própria.

Benefícios:

- validação centralizada;
- imutabilidade;
- redução de lógica duplicada;
- mais clareza semântica no código.

## Eventos de domínio

Evento de domínio representa algo relevante que aconteceu dentro do contexto do negócio.

Ele faz sentido quando:

- uma ação precisa gerar reação em outro ponto do sistema;
- a regra de negócio não deve ficar acoplada a quem consome a consequência;
- auditoria, notificação ou atualização derivada dependem de um fato já ocorrido.

Exemplos de uso provável no projeto:

- lead criado;
- negociação encerrada;
- mudança de status;
- vínculo de atendente com equipe.

## Contratos de repositório

Os contratos de repositório pertencem ao domínio ou à aplicação, conforme o nível de abstração escolhido pelo módulo, mas a implementação concreta fica sempre na infraestrutura.

Eles existem para:

- desacoplar regra de negócio do mecanismo de persistência;
- permitir troca de implementação sem reescrever o caso de uso;
- facilitar testes de fluxo.

O contrato define intenção. A infraestrutura define detalhe técnico.

## Specifications

`Specification` é útil para regras de seleção, validação ou elegibilidade mais compostas, especialmente quando uma regra:

- não cabe naturalmente dentro de uma única entidade;
- precisa ser reutilizada;
- combina múltiplos critérios.

Ela deve ser adotada quando realmente trouxer clareza. Não precisa ser introduzida por formalismo.

## Factories

`Factory` deve ser usada quando a criação do objeto:

- envolve muitos passos;
- depende de composição de vários elementos;
- precisa esconder detalhes de montagem;
- não deve ficar espalhada em controllers ou use cases.

Factories são particularmente úteis quando um módulo começar a criar entidades mais ricas, respostas de dashboard ou estruturas derivadas a partir de várias fontes.

## O que não pertence ao domínio

O domínio não deve conter:

- decorators HTTP;
- classes de controller;
- SQL;
- client de ORM;
- dependência de framework web;
- lógica de serialização de resposta.

## Impactos e implicações

- A modelagem de domínio fica mais expressiva e menos frágil.
- A equipe ganha linguagem comum para discutir regra de negócio.
- O custo inicial de modelagem aumenta um pouco, mas a previsibilidade melhora.
- O backend fica menos dependente de detalhe técnico e mais orientado ao problema real.

## Próximos passos

1. Aplicar esses building blocks nos primeiros módulos com regra mais rica, como `leads` e `negotiations`.
2. Explicitar exemplos reais do projeto quando as primeiras entidades forem implementadas.
3. Relacionar essa modelagem ao diagrama de classes do backend.
