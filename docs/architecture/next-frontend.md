# Frontend com Next.js

## O que é o Next.js

`Next.js` é o framework escolhido para a aplicação web do projeto. Ele oferece uma base estruturada para React com roteamento, renderização no servidor, composição por layout e separação mais clara entre código que roda no servidor e código que roda no navegador.

Referências oficiais:

- Getting started: https://nextjs.org/docs/app/getting-started
- App Router: https://nextjs.org/docs/app
- Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Data fetching: https://nextjs.org/docs/app/building-your-application/data-fetching

## Por que o projeto vai usar Next.js

O frontend deste projeto foi definido em `Next.js` porque a equipe quer uma aplicação web organizada, com boa base para crescer e com fronteira clara em relação à API em `NestJS`.

Os principais motivos são:

- App Router mais adequado para estruturar páginas, layouts e fluxos;
- suporte natural a `Server Components`, reduzindo código desnecessário no cliente;
- boa organização para uma aplicação que vai crescer por features;
- integração simples com `TypeScript`;
- ecossistema maduro para `Tailwind CSS 4`, `shadcn/ui` e composição de UI reaproveitável;
- alinhamento com a ideia de separar a experiência web da API, sem misturar backend de negócio no frontend.

## Como o Next.js será usado neste projeto

No repositório, o frontend seguirá esta linha:

- `front` será uma aplicação `Next.js`;
- `back` será uma aplicação `NestJS`;
- a comunicação entre os dois acontecerá exclusivamente por `HTTP/JSON`;
- o frontend não conterá regra crítica de autorização, persistência ou auditoria.

Em outras palavras: o `Next.js` será usado para a experiência web, enquanto a API em `NestJS` continuará sendo a fonte oficial das regras de negócio e segurança.

## Estrutura esperada

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── styles.css
├── components/
│   └── shared/
├── features/
│   ├── landing/
│   │   ├── components/
│   │   └── server/
│   └── leads/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── model/
│       ├── schemas/
│       └── types/
├── lib/
│   ├── auth/
│   ├── constants/
│   ├── env.ts
│   ├── http/
│   ├── query/
│   ├── routes/
│   └── utils.ts
└── styles/
    └── globals.css
```

## Regra de uso das pastas

- `app`: estrutura global da aplicação, rotas, layouts, páginas e estilos globais.
- `features`: organização por feature ou domínio de negócio do frontend.
- `components/shared`: UI reutilizável entre múltiplas features.
- `lib`: configuração, auth, clientes HTTP, query client, rotas e utilitários compartilhados.
- `server`: integração com a API, composição de dados no servidor e adaptação de contrato quando a feature exigir execução server-side.
- `api`: serviços HTTP reutilizáveis por uma feature.
- `hooks`: comportamento de interface e interação local do cliente, quando necessário.
- `model`, `schemas` e `types`: contratos, tipagens e validações da feature.

## Guia rápido de uso no dia a dia

### Quando usar `Server Components`

Use por padrão quando a tela:

- só precisa renderizar dados;
- pode montar a interface no servidor;
- não depende de evento de clique, input controlado ou estado interativo do navegador.

### Quando usar `Client Components`

Use `use client` apenas quando a tela ou componente precisar de:

- estado interativo no navegador;
- eventos como clique, digitação ou drag and drop;
- hooks do cliente, como `useState`, `useEffect` e afins;
- APIs do navegador.

### Onde buscar dados da API

O padrão esperado é:

- buscar dados no servidor sempre que possível;
- centralizar chamadas HTTP em `features/*/server`, `features/*/api` ou `lib/http`;
- evitar `fetch` espalhado em componentes visuais;
- manter o contrato com a API explícito.

### O que não fazer

- não duplicar regra de negócio do backend;
- não esconder permissão somente no frontend;
- não transformar `lib` ou `components/shared` em pasta de sobras;
- não usar `use client` por reflexo;
- não acoplar componente visual diretamente a detalhes de infraestrutura.

## Variáveis de ambiente

- `NEXT_PUBLIC_API_URL`: URL pública usada por código exposto ao navegador.
- `API_INTERNAL_URL`: URL usada pelo servidor do frontend para chamar a API internamente.
- o acesso a essas variáveis deve passar por `src/lib/env.ts`.

## Stack operacional atual do frontend

- `Next.js 16` com `React 19` e `TypeScript`;
- `Tailwind CSS 4` com `PostCSS`;
- `shadcn/ui`, `Radix UI`, `lucide-react`, `class-variance-authority` e `tailwind-merge` para composição visual;
- `Prettier` para formatação local do workspace do frontend;
- `ESLint` com `eslint-config-next` para validação estática.

## Regra de arquitetura importante

Mesmo usando `Next.js`, o frontend não é o backend do sistema. A aplicação web deve continuar consumindo a API em `NestJS` como cliente HTTP, preservando a separação entre apresentação e regras de negócio.

## Como evoluir a partir da base atual

1. Criar novas pastas em `features` por domínio, repetindo o conjunto mínimo de `api`, `components`, `hooks`, `model`, `schemas` e `types` quando fizer sentido.
2. Priorizar `Server Components` na composição inicial das telas.
3. Isolar integrações HTTP em funções específicas de servidor ou em serviços da feature.
4. Introduzir `Client Components` apenas quando a interação realmente exigir.
5. Manter contratos estáveis com a API antes de expandir a interface.
