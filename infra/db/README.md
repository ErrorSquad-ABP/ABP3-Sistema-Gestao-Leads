# Infraestrutura de Banco

Esta pasta contém um fluxo de banco descontinuado. Ela ainda registra bootstrap e automações baseadas em scripts SQL, mas está fora da trilha oficial do projeto, que deve ser conduzida por Prisma.

## Status desta camada

- este diretório está descontinuado para evolução funcional do banco;
- seu conteúdo existe apenas como resquício de uma estratégia anterior;
- novas decisões de schema, migrations e seeds não devem nascer aqui;
- a trilha oficial de persistência deve ser centralizada no Prisma.

## Direção oficial

- o backend deve evoluir o banco via `Prisma ORM`;
- schema, relações e constraints devem ser descritos no Prisma;
- migrations devem ser geradas pelo fluxo do Prisma;
- seeds devem seguir o fluxo da aplicação, sem depender de scripts SQL manuais como padrão.

## Estrutura atual

- `init/`: bootstrap de container, executado apenas na criação inicial do volume do PostgreSQL.
- `migrations/`: material descontinuado baseado em scripts SQL.
- `seeds/`: material descontinuado para carga controlada.
- `scripts/`: automações auxiliares do fluxo descontinuado.

## Regra de responsabilidade

- `init` continua sendo apenas bootstrap de ambiente;
- `migrations` e `seeds` existentes não devem ser tratados como referência para novas decisões arquiteturais;
- novas mudanças de banco devem entrar pelo Prisma;
- scripts descontinuados não devem receber expansão funcional.

## Estratégia operacional

O serviço `db-migrate` do Docker Compose ainda existe apenas para o fluxo descontinuado:

1. espera o PostgreSQL ficar saudável;
2. garante a existência do schema e da tabela de controle usada pelo fluxo descontinuado;
3. aplica migrations pendentes em ordem alfabética;
4. aplica seeds pendentes em ordem alfabética;
5. registra tudo na tabela de histórico.

## Regras de manutenção

- não editar migration já aplicada em ambiente compartilhado;
- centralizar a evolução futura do banco no Prisma;
- não expandir o fluxo descontinuado com novos scripts SQL manuais;
- manter a modelagem documentada em `docs/data/README.md`;
- alinhar índices e constraints com os relatórios e dashboards esperados do produto.
