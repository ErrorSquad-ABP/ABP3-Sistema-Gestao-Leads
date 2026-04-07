# Frontend

## Objetivo

O frontend será a aplicação web do sistema, responsável por oferecer uma navegação responsiva, clara e orientada ao fluxo comercial de leads, negociações e dashboards, consumindo a API Nest separada exclusivamente por `HTTP/JSON`.

## Stack definida

- Next.js 16 com React 19 e TypeScript
- App Router para composição de rotas, layouts e server components
- Tailwind CSS 4, shadcn/ui e Radix para a base visual
- Prettier para formatação do workspace do frontend
- ESLint com `eslint-config-next` para qualidade estática complementar

Guias complementares:

- **Plano de navegação, telas e UX (implementação):** [`../docs/architecture/frontend-information-architecture.md`](../docs/architecture/frontend-information-architecture.md)
- Uso do Next.js nesta base: [`../docs/architecture/next-frontend.md`](../docs/architecture/next-frontend.md)

## Princípios de implementação

- Interface guiada por papéis e permissões vindas do backend.
- Componentes pequenos, orientados a responsabilidade única.
- Separação entre `app`, `features`, `lib` e `components`.
- Uso preferencial de server components para composição inicial e client components apenas quando houver interação real no navegador.
- Estado local por feature antes de introduzir complexidade adicional.
- Consumo de API desacoplado da camada visual.

## Estrutura proposta

```text
front/
├── src/
│   ├── app/                # App Router, páginas, layouts e entrypoint de estilos
│   ├── components/         # Componentes compartilhados de UI
│   │   └── shared/
│   ├── features/           # Fatias por domínio com api, model, schema e UI
│   ├── lib/                # Config, auth, HTTP, query e utilitários
│   └── styles/             # CSS compartilhado de apoio, quando necessário
├── .env.example            # Variáveis do frontend e URL da API
├── components.json         # Configuração do shadcn/ui
├── next.config.ts          # Configuração do Next.js
├── next-env.d.ts           # Tipagens geradas pelo Next.js
├── postcss.config.mjs      # Integração do Tailwind CSS 4
├── package.json
└── tsconfig.json
```

## Features presentes na base

- `landing`: página inicial e checagem de disponibilidade da API.
- `login`: autenticação do usuário.
- `leads`, `customers`, `deals`, `stores`, `teams` e `users`: fatias previstas para o fluxo comercial e administrativo.
- `audit-logs`: apoio às telas e consultas de auditoria.

## Boas práticas esperadas

- Não duplicar regra de negócio do backend.
- Não esconder autorização somente no frontend.
- Priorizar acessibilidade, feedback visual e responsividade.
- Centralizar integração HTTP em `features/*/api`, `features/*/server` ou `lib/http`.
- Deixar os componentes de página livres de lógica de infraestrutura.
- Consumir a API separada por contratos explícitos e payloads previsíveis.

## Convenções de pastas

- `app`: tudo que compõe o esqueleto global da aplicação.
- `features`: telas, componentes, contratos e modelos específicos de cada domínio.
- `components/shared`: blocos visuais reaproveitáveis entre múltiplas features.
- `lib`: infraestrutura transversal de frontend, incluindo `env`, clientes HTTP e query setup.
- `styles`: CSS compartilhado de apoio; o entrypoint global atual do App Router está em `src/app/styles.css`.

## Variáveis de ambiente

- `NEXT_PUBLIC_API_URL`: URL pública da API para navegação e chamadas expostas ao navegador.
- `API_INTERNAL_URL`: URL interna usada pelo servidor Next do frontend para consultar a API sem depender da mesma origem.
- O acesso a essas variáveis deve ser centralizado em `src/lib/env.ts`.

## Evolução esperada

Nas primeiras sprints, esta camada deve cobrir autenticação, listagem de leads, telas de negociação e os painéis gerenciais. Em paralelo, os componentes compartilhados devem consolidar uma linguagem visual única para o projeto e contratos estáveis com a API.
