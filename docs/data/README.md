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
- eventos operacionais de lead (`LeadEvent`);
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

## Registro da evolução recente do schema

Com a entrega do detalhe operacional do lead, o schema passou a incluir:

- tabela `LeadEvent` para timeline operacional do lead;
- enum `LeadEventType` com tipos de evento de operação (`CREATED`, `UPDATED`, `REASSIGNED`, `CONVERTED`);
- relacionamento `Lead 1:N LeadEvent`;
- relacionamento opcional `User 1:N LeadEvent` como ator da ação;
- índices por `leadId + createdAt` e por `actorUserId` para leitura eficiente da timeline.

Migration correspondente no repositório:

- `back/prisma/migrations/20260426195800_lead_operational_events/migration.sql`

## Regras de evolução

- mudanças estruturais entram por models + migrations Prisma;
- migrations já compartilhadas não devem ser reescritas;
- seeds precisam ser reproduzíveis;
- integridade referencial deve continuar explícita no schema;
- o modelo lógico e os diagramas devem acompanhar o banco real.

### Regra específica para `LeadEvent.payload`

- o payload deve ser mínimo e orientado a uso operacional;
- dados técnicos e identificadores internos não devem ser expostos no contrato público da API;
- qualquer expansão de payload deve considerar impacto de volume e necessidade real de consulta.

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
- o modelo atual já contempla relações relevantes de `users`, `teams`, `stores`, `customers`, `leads`, `lead_events`, `vehicles` e `deals`
- o vínculo organizacional do utilizador já segue o modelo multi-team, sem depender de `teamId` único como fonte de verdade
