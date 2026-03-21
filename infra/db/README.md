# Infraestrutura de Banco

Esta pasta centraliza a estratégia SQL do projeto. O objetivo é deixar explícito, desde a base, onde vivem o bootstrap do PostgreSQL, as migrations versionadas e os seeds controlados do sistema.

## Objetivos desta camada

- manter `DDL` e `DML` versionados no repositório;
- permitir subida previsível do ambiente via Docker Compose;
- evitar divergência estrutural entre máquinas da equipe;
- criar uma trilha clara de evolução do banco desde o início do semestre.

## Estrutura adotada

- `init/`: bootstrap de container, executado apenas na criação inicial do volume do PostgreSQL.
- `migrations/`: scripts SQL versionados para evolução estrutural do schema.
- `seeds/`: scripts SQL para dados de referência e carga controlada.
- `scripts/`: automações auxiliares para aplicar migrations e seeds via Docker.

## Regra de responsabilidade por pasta

- `init` não substitui migrations; ele só prepara o ambiente do container.
- `migrations` é a fonte oficial de evolução do schema.
- `seeds` não deve conter dado aleatório de teste; apenas dados controlados e reprodutíveis.
- novas mudanças de banco devem entrar por novos arquivos versionados, sem reescrever scripts já compartilhados.

## Convenção de nomenclatura

- migrations: `NNN_descricao_curta.sql`
- seeds: `NNN_descricao_curta.sql`

Exemplos:

- `001_initial_schema.sql`
- `002_auth_and_users.sql`
- `001_reference_data.sql`

## Estratégia operacional

O serviço `db-migrate` do Docker Compose:

1. espera o PostgreSQL ficar saudável;
2. garante a existência do schema e da tabela de controle `lead_management.schema_migrations`;
3. aplica migrations pendentes em ordem alfabética;
4. aplica seeds pendentes em ordem alfabética;
5. registra tudo na tabela de histórico.

## Regras de manutenção

- não editar migration já aplicada em ambiente compartilhado;
- criar uma nova migration para qualquer ajuste estrutural;
- escrever SQL idempotente quando fizer sentido;
- manter a modelagem documentada em `docs/data/README.md`;
- alinhar índices e constraints com os relatórios e dashboards esperados do produto.
