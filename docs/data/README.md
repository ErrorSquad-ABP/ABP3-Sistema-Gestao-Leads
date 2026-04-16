# Dados e Modelagem

## Objetivo

Consolidar o estado atual da modelagem relacional, da persistência e dos artefatos ligados ao banco.

## Núcleos de dados já representados no schema atual

- utilizadores e papéis;
- grupos de acesso administrativos;
- equipas;
- lojas;
- clientes;
- leads;
- veículos;
- negociações com histórico mínimo no backend;
- sessões de autenticação;
- deals usados no seed analítico.

## Núcleos ainda não fechados como produto

- negociações como módulo funcional completo no frontend;
- veículos como módulo funcional completo no frontend;
- logs administrativos completos.

## Estratégia de persistência adotada

Prisma continua sendo a tecnologia oficial de evolução do banco. Isso implica:

- schema como fonte primária da estrutura relacional;
- migrations versionadas em `back/prisma/migrations`;
- seed versionado em `back/prisma/seed.ts`;
- sem evolução oficial baseada em SQL manual isolado.

## Regras de evolução

- mudanças estruturais entram por models + migrations Prisma;
- migrations já compartilhadas não devem ser reescritas;
- seeds precisam ser reproduzíveis;
- integridade referencial deve continuar explícita no schema;
- o modelo lógico e os diagramas devem acompanhar o banco real.

## Estado atual do bootstrap

Bootstrap estrutural:

- `back/prisma/schema.prisma`
- `back/prisma/migrations/`
- `back/prisma/seed.ts`

Modos de seed:

- `minimal`: autenticação e dados mestres mínimos
- `dashboard`: dataset fictício completo para demonstração analítica

## Diagramas e artefatos relacionados

- DER e diagramas correlatos devem ser lidos em conjunto com [docs/diagrams/README.md](../diagrams/README.md)
- o modelo atual já contempla relações relevantes de `users`, `teams`, `stores`, `customers`, `leads`, `vehicles` e `deals`
- o vínculo organizacional do utilizador já segue o modelo multi-team, sem depender de `teamId` único como fonte de verdade
