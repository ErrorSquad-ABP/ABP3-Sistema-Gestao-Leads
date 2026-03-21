# Migrations

Esta pasta contém a evolução estrutural do banco em SQL explícito.

## Regras

- cada arquivo representa um passo versionado de `DDL`;
- a ordem de execução é definida pelo prefixo numérico do nome do arquivo;
- migrations já compartilhadas não devem ser reescritas;
- qualquer alteração nova entra como novo arquivo.

## Situação atual

- `001_initial_schema.sql`: baseline inicial do schema e metadados do banco.
