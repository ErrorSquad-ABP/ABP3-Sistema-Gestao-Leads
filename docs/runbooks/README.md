# Runbooks Operacionais

Este diretório documenta o fluxo real de operação do projeto.

## Cobertura

- `local-setup.md`: os **quatro modos** oficiais de subida (Docker/native × banco remoto/local).
- `setup-windows.md`: fluxo sem Docker Desktop (faculdade / Windows 10).
- `deploy.md`: produção em `Vercel + Neon`, smoke checks e cuidados de ambiente.

## Regra editorial

Se o código ou a topologia operacional mudar, o runbook correspondente deve mudar na mesma entrega.

Comandos oficiais na raiz:

- `npm run start:docker:remote`
- `npm run start:docker:local`
- `npm run start:native:remote`
- `npm run start:native:local`
