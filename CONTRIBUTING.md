# Contribuindo

## Fluxo de branches

- `main`: somente releases e baseline estável.
- `develop`: integração da equipe.
- `feature/*`: novas funcionalidades.
- `fix/*`: correções.
- `refactor/*`: refatorações sem mudança de comportamento funcional esperada.
- `chore/*`: manutenção técnica e ajustes auxiliares.

## Fluxo recomendado

1. Criar branch a partir de `develop`.
2. Subir o ambiente com `npm run dev` quando precisar de hot reload ou `npm run compose:up` para validar a execução base.
3. Implementar a mudança em commits pequenos e descritivos.
4. Se houver mudança de banco, criar novo arquivo SQL em `infra/db/migrations/` ou `infra/db/seeds/`.
5. Aplicar migrations pendentes com `npm run db:migrate` quando necessário.
6. Executar quality gate local.
7. Abrir PR para `develop`.
8. Promover `develop` para `main` quando houver baseline estável.

## Convenção de commits

- `feat(escopo): mensagem`
- `fix(escopo): mensagem`
- `refactor(escopo): mensagem`
- `style(escopo): mensagem`
- `perf(escopo): mensagem`
- `chore(escopo): mensagem`

## Quality gate local

```bash
npm install
npm run check:ci
npm run quality:gate:blocking
npm run build
```

## Banco e SQL versionado

- `infra/db/init`: bootstrap do PostgreSQL no primeiro start do volume.
- `infra/db/migrations`: evolução estrutural versionada.
- `infra/db/seeds`: dados de referência controlados.
- novas alterações de banco devem entrar em novos arquivos SQL, sem reescrever migrations já compartilhadas.

## Observação importante

O workflow do repositório já recusa PRs indevidos para `main` e sinaliza push direto em `main`. Ainda assim, a proteção definitiva dessa branch deve ser reforçada nas configurações do GitHub com branch protection ou rulesets.
