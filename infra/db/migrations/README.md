# Migrations

Esta pasta contém migrations de um fluxo descontinuado baseado em SQL manual. Ela não deve ser tratada como estratégia válida para a evolução oficial do banco.

## Regras

- cada arquivo representa um passo versionado do fluxo descontinuado;
- a ordem de execução é definida pelo prefixo numérico do nome do arquivo;
- migrations já compartilhadas não devem ser reescritas;
- novas alterações não devem entrar aqui; a evolução oficial deve ocorrer pelo fluxo de migrations do Prisma.

## Situação atual

- `001_initial_schema.sql`: baseline inicial do schema e metadados do banco.
