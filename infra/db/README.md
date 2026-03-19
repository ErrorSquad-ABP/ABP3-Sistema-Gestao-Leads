# Infraestrutura de Banco

Os scripts desta pasta representam o bootstrap inicial do PostgreSQL para desenvolvimento local.

## Objetivos desta camada

- manter DDL e DML versionados;
- facilitar a subida do ambiente via Docker Compose;
- preparar o terreno para evolução controlada do modelo relacional.

## Conteúdo atual

- `init/00_extensions.sql`: extensões base do PostgreSQL;
- `init/10_bootstrap.sql`: schema inicial do projeto.
