# Backend

## Objetivo

O backend será a aplicação de API do sistema, responsável por autenticação, autorização, persistência, consistência transacional, auditoria e exposição dos contratos REST consumidos pelo frontend via `HTTP/JSON`.

## Stack definida

- Node.js com TypeScript
- Next.js para a aplicação de API
- PostgreSQL como banco relacional
- Docker para execução padronizada
- Biome, ESLint e TypeScript Checker como quality gate

## Padrão arquitetural interno

O backend seguirá `Monólito Modular` com `Arquitetura em Camadas`:

- `presentation` ou `route handlers`: entrada HTTP
- `application` ou `services`: casos de uso
- `domain`: entidades e regras centrais
- `data access` ou `repositories`: persistência
- `shared`: cross-cutting concerns

## Estrutura proposta

```text
back/
├── src/
│   ├── app/                # App Router e handlers da API
│   ├── infrastructure/     # Adaptadores HTTP, DB e integrações
│   ├── modules/            # Módulos de negócio do sistema
│   ├── shared/             # Config, erros, auth, middlewares e utilitários
├── .env.example
├── next.config.ts
├── next-env.d.ts
├── package.json
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
- Regras de negócio não devem ficar em route handlers.
- Logs de operações críticas devem ser centralizados.
- Filtros temporais precisam ser validados no servidor.
- O frontend deve consumir esta aplicação como cliente HTTP, sem compartilhamento indevido de regra de negócio.

## Caminho de evolução sugerido

1. Criar módulo de autenticação com JWT.
2. Implementar RBAC por papel.
3. Estruturar entidades centrais: usuário, equipe, loja, cliente e lead.
4. Evoluir para negociação com histórico.
5. Introduzir queries analíticas otimizadas para dashboards.
6. Adicionar filas, cache e consolidações assíncronas apenas quando houver necessidade operacional real.
