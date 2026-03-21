# Frontend

## Objetivo

O frontend será a aplicação web do sistema, responsável por oferecer uma navegação responsiva, clara e orientada ao fluxo comercial de leads, negociações e dashboards, consumindo a API Nest separada exclusivamente por `HTTP/JSON`.

## Stack definida

- Next.js com React e TypeScript
- App Router para composição de rotas, layouts e server components
- CSS modularizado por responsabilidade
- Biome para format e lint rápido
- ESLint para qualidade estática complementar e segurança

Guia complementar de uso do Next.js nesta base:

- [`../docs/architecture/next-frontend.md`](../docs/architecture/next-frontend.md)

## Princípios de implementação

- Interface guiada por papéis e permissões vindas do backend.
- Componentes pequenos, orientados a responsabilidade única.
- Separação entre `app`, `modules` e `shared`.
- Uso preferencial de server components para composição inicial e client components apenas quando houver interação real no navegador.
- Estado local por feature antes de introduzir complexidade adicional.
- Consumo de API desacoplado da camada visual.

## Estrutura proposta

```text
front/
├── src/
│   ├── app/                # App Router, layouts, páginas e estilos globais
│   ├── modules/            # Features por domínio de negócio
│   └── shared/             # Componentes reutilizáveis, config, hooks, utils, types
├── .env.example            # Variáveis do frontend e URL da API
├── next.config.ts          # Configuração do Next.js
├── next-env.d.ts           # Tipagens geradas pelo Next.js
├── package.json
└── tsconfig.json
```

## Módulos previstos

- `auth`: login, sessão e atualização de credenciais.
- `dashboard`: indicadores operacionais e analíticos.
- `leads`: captação, listagem e edição.
- `customers`: vínculo e manutenção dos clientes.
- `negotiations`: evolução, estágio, status e histórico.
- `settings`: perfil do usuário e preferências operacionais.

## Boas práticas esperadas

- Não duplicar regra de negócio do backend.
- Não esconder autorização somente no frontend.
- Priorizar acessibilidade, feedback visual e responsividade.
- Centralizar integração HTTP em `shared`.
- Deixar os componentes de página livres de lógica de infraestrutura.
- Consumir a API separada por contratos explícitos e payloads previsíveis.

## Convenções de pastas

- `app`: tudo que compõe o esqueleto global da aplicação.
- `modules`: telas, componentes e fluxos específicos de cada domínio.
- `shared`: elementos realmente reaproveitáveis entre módulos.

## Variáveis de ambiente

- `NEXT_PUBLIC_API_URL`: URL pública da API para navegação e chamadas expostas ao navegador.
- `API_INTERNAL_URL`: URL interna usada pelo servidor Next do frontend para consultar a API sem depender da mesma origem.

## Evolução esperada

Nas primeiras sprints, esta camada deve cobrir autenticação, listagem de leads, telas de negociação e os painéis gerenciais. Em paralelo, os componentes compartilhados devem consolidar uma linguagem visual única para o projeto e contratos estáveis com a API.
