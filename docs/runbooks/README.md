# Runbooks Operacionais

Este diretório documenta o fluxo real de operação do projeto.

## Cobertura

- `local-setup.md`: bootstrap local com `docker compose` atual e banco externo via `DATABASE_URL`.
- `deploy.md`: operação de produção em `Vercel + Neon`, smoke checks e cuidados de ambiente.

## Regra editorial

Se o código ou a topologia operacional mudar, o runbook correspondente deve mudar na mesma entrega. Hoje isso é especialmente importante porque:

- o Compose não sobe mais PostgreSQL local por padrão;
- migrations e seeds são operações explícitas;
- a produção está ativa e precisa de documentação aderente ao runtime real.
