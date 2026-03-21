# Dados e Modelagem

## Objetivo

Esta área será usada para consolidar o modelo relacional, o DER, o dicionário de dados e as decisões de integridade da base PostgreSQL.

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
- Estratégia de DDL e DML versionada no repositório.

## Estratégia SQL adotada

O projeto passa a diferenciar claramente quatro responsabilidades:

- `infra/db/init/`: bootstrap do container PostgreSQL;
- `infra/db/migrations/`: evolução estrutural do banco em SQL versionado;
- `infra/db/seeds/`: dados de referência versionados;
- `lead_management.schema_migrations`: tabela de controle do que já foi aplicado.

Essa separação existe para evitar um problema comum em times acadêmicos: cada máquina ficar com um banco diferente depois de algumas semanas de desenvolvimento.

## Regras de evolução do banco

- mudanças estruturais entram em novas migrations SQL;
- migrations antigas não devem ser reescritas depois de compartilhadas;
- seeds devem ser reprodutíveis e voltados a dados estáveis;
- o Docker Compose deve continuar sendo capaz de subir um ambiente consistente do zero;
- o modelo lógico e o DER devem acompanhar a evolução das migrations.

## Artefatos planejados

- DER oficial
- Dicionário de dados
- Scripts SQL versionados
- Estratégia de migração
- Política de dados de referência

## Bootstrap atual

O bootstrap inicial do banco está em `infra/db/init/`, enquanto a evolução versionada já parte de `infra/db/migrations/001_initial_schema.sql`.
