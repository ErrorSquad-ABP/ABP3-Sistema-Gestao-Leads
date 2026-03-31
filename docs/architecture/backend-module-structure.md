# Estrutura Modular do Backend

## Objetivo

Descrever como os módulos do backend devem ser organizados e qual responsabilidade pertence a cada pasta e camada do módulo.

## Contexto

O backend foi adotado como `monólito modular`, então a estrutura dos módulos não é apenas estética. Ela define como o domínio será isolado, como os fluxos serão testados e como a equipe deve distribuir responsabilidade sem criar acoplamento acidental.

## Estrutura base

Cada módulo deve seguir a estrutura abaixo:

```text
src/modules/leads/
├── application/
├── domain/
├── infrastructure/
├── presentation/
└── leads.module.ts
```

Além dos módulos, o backend possui:

```text
src/
├── app.module.ts
├── main.ts
├── modules/
└── shared/
```

## Papel de cada camada

### `domain`

Concentra o núcleo do módulo:

- entidades;
- value objects;
- enums;
- contratos de repositório;
- políticas e invariantes.

Não deve conhecer:

- NestJS;
- controllers;
- Prisma Client ou detalhes de migrations;
- implementação concreta de banco.

### `application`

Coordena o fluxo de execução do módulo:

- use cases;
- serviços de aplicação;
- handlers;
- montagem da resposta de negócio quando necessário.

Não deve virar:

- controller disfarçado;
- repositório concreto;
- lugar para regra puramente de infraestrutura.

### `infrastructure`

Implementa os detalhes externos do módulo:

- repositórios concretos;
- gateways;
- integrações;
- adaptação para banco e serviços externos.

Ela depende de contratos internos do módulo, mas não deve ditar a regra de negócio.

### `presentation`

Faz a adaptação para HTTP:

- controllers;
- DTOs de entrada e saída;
- serialização;
- mapeamento entre requisição e caso de uso.

Controllers devem permanecer finos e previsíveis.

## Papel do `shared`

`shared` existe para preocupações realmente transversais:

- config;
- autenticação compartilhada;
- filtros;
- pipes;
- exceptions;
- utilitários comuns.

`shared` não deve se tornar:

- depósito genérico;
- atalho para acoplamento entre módulos;
- lugar para regras específicas de um domínio.

## Regra de fronteira entre módulos

Cada módulo deve ser capaz de evoluir sem depender da infraestrutura interna de outro módulo.

Diretrizes:

- um módulo não importa repositório concreto de outro;
- um módulo não acessa tabela de outro de forma informal pelo código de aplicação;
- a conversa entre módulos deve ocorrer por contratos claros, serviços internos bem definidos ou eventos;
- infraestrutura permanece encapsulada no módulo de origem.

## Exemplo de leitura correta da estrutura

Quando a equipe olha para `src/modules/leads`, a expectativa é encontrar um contexto completo de negócio, e não apenas uma pasta visual com arquivos soltos.

Isso significa que o módulo deve concentrar:

- sua modelagem de domínio;
- seus casos de uso;
- sua infraestrutura necessária;
- sua adaptação HTTP.

## Impactos e implicações

- A organização fica mais disciplinada desde o início.
- Fica mais fácil identificar onde uma mudança deve acontecer.
- A equipe reduz o risco de criar dependências cruzadas difíceis de remover depois.
- O backend ganha uma base mais compatível com manutenção, testes e escala gradual.

## Próximos passos

1. Repetir essa estrutura nos primeiros módulos de negócio implementados.
2. Documentar contratos entre módulos sempre que uma integração interna surgir.
3. Manter `shared` sob revisão constante para não virar pasta de sobras.
