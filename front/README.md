# Frontend

## Objetivo

O frontend será a camada de apresentação do sistema, responsável por oferecer uma navegação responsiva, clara e orientada ao fluxo comercial de leads, negociações e dashboards.

## Stack definida

- React com TypeScript
- Vite como bundler e servidor de desenvolvimento
- CSS modularizado por responsabilidade
- Biome para format e lint rápido
- ESLint para qualidade estática complementar e segurança

## Princípios de implementação

- Interface guiada por papéis e permissões vindas do backend.
- Componentes pequenos, orientados a responsabilidade única.
- Separação entre `app`, `modules` e `shared`.
- Estado local por feature antes de introduzir complexidade adicional.
- Consumo de API desacoplado da camada visual.

## Estrutura proposta

```text
front/
├── public/                 # Assets públicos
├── src/
│   ├── app/                # Shell da aplicação, providers, estilos globais
│   ├── modules/            # Features por domínio de negócio
│   ├── shared/             # Componentes reutilizáveis, hooks, utils, types
│   ├── App.tsx             # Composição inicial da aplicação
│   └── main.tsx            # Bootstrap React
├── .env.example            # Variáveis públicas do frontend
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

## Convenções de pastas

- `app`: tudo que compõe o esqueleto global da aplicação.
- `modules`: telas, componentes e fluxos específicos de cada domínio.
- `shared`: elementos realmente reaproveitáveis entre módulos.

## Evolução esperada

Nas primeiras sprints, esta camada deve cobrir autenticação, listagem de leads, telas de negociação e os painéis gerenciais. Em paralelo, os componentes compartilhados devem consolidar uma linguagem visual única para o projeto.
