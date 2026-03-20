# Qualidade e Revisão

## Objetivo

Este documento consolida o fluxo obrigatório de validação técnica do projeto para reduzir divergência entre o que a equipe roda localmente e o que o GitHub Actions valida no repositório.

## Fluxo local obrigatório

Antes de abrir qualquer pull request, cada integrante deve executar:

1. `npm run format`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run lint:eslint`
5. `npm run build`

Esse fluxo cobre:

- formatação automática com `Biome`
- lint automático com `Biome`
- checagem estática complementar com `ESLint`
- validação de tipos com `TypeScript`
- validação de build do `front` e do `back`

## Fluxo de CI obrigatório

No GitHub Actions, o workflow `Quality Gate` executa os equivalentes em modo de validação:

1. `npm run guard:root-package`
2. `npm run format:check`
3. `npm run lint:check`
4. `npm run typecheck`
5. `npm run lint:eslint`
6. `npm run build`

Se qualquer etapa falhar, o status `validate` falha e o merge na `main` fica bloqueado.

## Política de dependências no single repository

O `package.json` da raiz não deve receber dependências de aplicação. Ele existe para:

- tooling compartilhado;
- scripts de orquestração do repositório único;
- padronização de qualidade e build.

Instalação correta por workspace:

- frontend: `npm i <pacote> -w front`
- backend: `npm i <pacote> -w back`

Se alguém adicionar dependências de runtime na raiz, o CI falha no passo `guard:root-package`.
## Snyk

O `Snyk` faz parte do padrão operacional do projeto via extensão do VS Code. Neste momento ele atua como apoio ao desenvolvimento local e revisão manual, não como etapa automatizada do GitHub Actions.

Extensão recomendada:

- `snyk-security.snyk-vulnerability-scanner`

## Política de revisão

- PR para `main` deve sair exclusivamente de `develop`.
- A `main` exige aprovação com `CODEOWNERS`.
- A aprovação válida para a `main` deve vir de `@JV-L0pes` ou `@Leo-Slv`.
- O merge na `main` depende do status `validate` aprovado.
- Para o time de desenvolvimento, a `main` deve ser tratada como branch sem push direto e sem merge fora do fluxo `develop -> main`.
- `@JV-L0pes` e `@Leo-Slv` possuem autonomia de bypass por governança da liderança técnica e contingência operacional, mas isso não substitui o fluxo padrão adotado pela equipe.
