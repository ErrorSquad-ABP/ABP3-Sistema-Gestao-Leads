# Backend com NestJS

## O que é o NestJS

`NestJS` é um framework para Node.js orientado a módulos, classes, decorators e injeção de dependência. Na prática, ele oferece uma base mais estruturada para aplicações backend, especialmente quando o projeto precisa crescer com fronteiras claras entre transporte HTTP, casos de uso, domínio e infraestrutura.

Referências oficiais:

- First steps: https://docs.nestjs.com/first-steps
- Modules: https://docs.nestjs.com/modules
- Controllers: https://docs.nestjs.com/controllers
- OpenAPI/Swagger: https://docs.nestjs.com/openapi/introduction

## Por que o projeto vai usar NestJS

O backend deste projeto foi reposicionado para `NestJS` porque ele conversa melhor com a arquitetura que a equipe quer sustentar:

- modularidade explícita por domínio;
- baixo acoplamento entre partes do sistema;
- uso de decorators e classes para organizar controllers, providers e módulos;
- injeção de dependência nativa;
- estrutura mais próxima do estilo defendido pelo time e pelo parceiro técnico;
- melhor aderência a um backend pensado como `monólito modular`.

Em resumo: o objetivo não é usar Nest por moda, mas por alinhamento com separação de responsabilidades, crescimento controlado e clareza arquitetural.

Guias complementares:

- [`ddd-clean-architecture.md`](./ddd-clean-architecture.md)
- [`backend-module-structure.md`](./backend-module-structure.md)
- [`domain-building-blocks.md`](./domain-building-blocks.md)
- [`backend-request-flow.md`](./backend-request-flow.md)

## Como o NestJS será usado neste projeto

No repositório, o backend seguirá esta linha:

- `front` continua em `Next.js`;
- `back` passa a ser uma aplicação `NestJS`;
- comunicação entre os dois continua por `HTTP/JSON`;
- o backend centraliza autenticação, autorização, regras de negócio e contratos REST.

## Estrutura modular esperada

Cada módulo do backend deve seguir a mesma ideia-base:

```text
src/
├── app.module.ts
├── main.ts
├── modules/
│   └── leads/
│       ├── application/
│       ├── domain/
│       ├── infrastructure/
│       ├── presentation/
│       └── leads.module.ts
└── shared/
```

## Regra de uso das camadas

- `presentation`: controllers, decorators HTTP, DTOs de transporte e adaptação da entrada/saída.
- `application`: use cases, serviços de orquestração e fluxos de negócio.
- `domain`: entidades, value objects, enums, contratos e regras centrais.
- `infrastructure`: repositórios concretos, gateways e adaptações específicas do módulo.
- `shared`: apenas preocupações transversais de verdade, como config, auth, filtros, pipes e utilitários comuns.

## Regras importantes da arquitetura

- não criar uma pasta `src/app` no backend, porque ele não é Next;
- não centralizar uma pasta `src/infrastructure` global para tudo;
- cada módulo deve possuir sua própria `infrastructure` quando precisar de implementação concreta;
- `shared` não é depósito genérico: entra ali só o que for realmente transversal;
- controller não concentra regra de negócio;
- módulo Nest é a unidade organizacional do domínio, não apenas um agrupador visual.

## Como evoluir a partir da base atual

1. Criar um módulo por domínio relevante do negócio.
2. Definir contratos de aplicação e domínio antes de introduzir persistência concreta.
3. Adicionar infraestrutura por módulo conforme o caso real aparecer.
4. Manter controllers finos, use cases claros e entidades coesas.
5. Registrar decisões arquiteturais quando o backend ganhar novas peças transversais.
