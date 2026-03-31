# Dados e Modelagem

## Objetivo

Esta área será usada para consolidar o modelo relacional, o DER, o dicionário de dados e as decisões de integridade da base PostgreSQL, com a evolução estrutural pensada a partir de ORM e não de scripts SQL manuais.

## Núcleos de dados previstos

- Usuários e papéis
- Equipes
- Lojas
- Clientes
- Leads
- Negociações
- Histórico de status e estágio
- Logs de acesso e operações

## Diretrizes de modelagem

- Chaves estrangeiras explícitas e integridade referencial obrigatória.
- Histórico de mudanças para negociação e trilhas de auditoria.
- Índices orientados a consultas analíticas e filtros temporais.
- Estratégia de schema, migrations e seeds versionada no repositório por meio do Prisma.

## Estratégia de persistência adotada

Prisma é a tecnologia oficial para evolução do banco no projeto. Isso significa:

- o schema da aplicação deve ser descrito no ORM;
- mudanças estruturais devem nascer de models, relações, enums e constraints modeladas no Prisma;
- migrations devem ser geradas e aplicadas pelo fluxo do Prisma;
- seeds devem ser tratadas como parte do fluxo da aplicação, mantendo reprodutibilidade e versionamento.

Essa direção existe para evitar um problema comum em times acadêmicos: cada máquina ficar com um banco diferente depois de algumas semanas de desenvolvimento, além de reduzir acoplamento prematuro com SQL manual.

## Fluxo descontinuado

Ainda existe um scaffold em `infra/db/` baseado em scripts SQL manuais. Esse material está descontinuado e não deve ser usado como estratégia arquitetural, operacional ou documental do projeto.

## Regras de evolução do banco

- mudanças estruturais entram por models e novas migrations geradas pelo Prisma;
- migrations antigas não devem ser reescritas depois de compartilhadas;
- seeds devem ser reprodutíveis e voltados a dados estáveis;
- o Docker Compose deve continuar sendo capaz de subir um ambiente consistente do zero;
- o modelo lógico e o DER devem acompanhar a evolução das migrations;
- scripts SQL manuais não devem ser introduzidos como caminho oficial de evolução.

## Artefatos planejados

- DER oficial
- Dicionário de dados
- Schema, migrations e seeds versionados por ORM
- Estratégia de migração
- Política de dados de referência

## Bootstrap atual

O bootstrap inicial do banco ainda está representado em `infra/db/init/`, mas esse arranjo está descontinuado. A referência oficial do projeto deve ficar centralizada no Prisma no backend.
