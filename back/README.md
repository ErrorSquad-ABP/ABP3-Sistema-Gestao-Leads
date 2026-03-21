# Backend

## Objetivo

O backend será a aplicação de API do sistema, responsável por autenticação, autorização, persistência, consistência transacional, auditoria e exposição dos contratos REST consumidos pelo frontend via `HTTP/JSON`.

## Stack definida

- Node.js com TypeScript
- NestJS para a aplicação de API
- PostgreSQL como banco relacional
- Docker para execução padronizada
- Biome, ESLint e TypeScript Checker como quality gate

## O que é NestJS e por que usar aqui

NestJS é o framework escolhido para o backend porque ele favorece exatamente o tipo de organização que o projeto quer defender: módulos explícitos, decorators, controllers finos, injeção de dependência e separação clara entre camadas.

Neste projeto, ele foi adotado porque:

- conversa bem com a ideia de `monólito modular`;
- ajuda a manter baixo acoplamento entre domínios;
- facilita composição por módulo, provider e controller;
- reforça um backend mais estruturado e previsível para crescer ao longo do semestre.

Referências oficiais:

- https://docs.nestjs.com/first-steps
- https://docs.nestjs.com/modules
- https://docs.nestjs.com/controllers
- https://docs.nestjs.com/openapi/introduction

Guia complementar do projeto:

- [`../docs/architecture/nest-backend.md`](../docs/architecture/nest-backend.md)

## Padrão arquitetural interno

O backend seguirá `Monólito Modular` com `Arquitetura em Camadas`:

- `presentation` ou `controllers`: entrada HTTP
- `application` ou `services`: casos de uso
- `domain`: entidades e regras centrais
- `infrastructure`: implementação concreta de repositórios, gateways e adaptadores do módulo
- `shared`: cross-cutting concerns

## Estrutura proposta

```text
back/
├── src/
│   ├── app.module.ts       # Módulo raiz da aplicação Nest
│   ├── main.ts             # Bootstrap do Nest e configuração global
│   ├── modules/            # Módulos de negócio do sistema
│   └── shared/             # Config, auth, filtros, pipes e utilitários transversais
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```

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

## Regras técnicas obrigatórias

- Toda autorização deve acontecer no backend.
- Cada módulo deve conter responsabilidades claras e poucas dependências externas.
- Regras de negócio não devem ficar em controllers.
- Logs de operações críticas devem ser centralizados.
- Filtros temporais precisam ser validados no servidor.
- O frontend deve consumir esta aplicação como cliente HTTP, sem compartilhamento indevido de regra de negócio.
- Não deve existir uma pasta `src/app` nem uma `src/infrastructure` global no backend.
- Cada módulo implementa sua própria `infrastructure` quando precisar de implementação concreta.

## Como usar o Nest nesta base

1. Criar um módulo por domínio relevante.
2. Colocar `controllers` em `presentation`.
3. Colocar use cases em `application`.
4. Colocar entidades, enums e contratos em `domain`.
5. Colocar repositórios e gateways concretos em `infrastructure`.
6. Colocar apenas preocupações transversais em `shared`.

## Caminho de evolução sugerido

1. Criar módulo de autenticação com JWT.
2. Implementar RBAC por papel.
3. Estruturar entidades centrais: usuário, equipe, loja, cliente e lead.
4. Evoluir para negociação com histórico.
5. Introduzir queries analíticas otimizadas para dashboards.
6. Adicionar filas, cache e consolidações assíncronas apenas quando houver necessidade operacional real.
