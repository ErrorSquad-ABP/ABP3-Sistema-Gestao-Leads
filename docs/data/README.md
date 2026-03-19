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

## Artefatos planejados

- DER oficial
- Dicionário de dados
- Scripts SQL versionados
- Estratégia de migração
- Política de dados de referência

## Bootstrap atual

O bootstrap inicial do banco está em `infra/db/init/`, contendo extensões e estrutura mínima para o ambiente de desenvolvimento.
