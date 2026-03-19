# API REST

## Direção inicial

A API será orientada a recursos, com versionamento por prefixo e contratos explícitos entre frontend e backend.

Prefixo inicial sugerido:

```text
/api/v1
```

## Recursos previstos

- `/auth`
- `/users`
- `/teams`
- `/stores`
- `/customers`
- `/leads`
- `/negotiations`
- `/dashboards`
- `/audit-logs`

## Regras operacionais

- JWT obrigatório para rotas protegidas.
- RBAC aplicado no backend conforme papel do usuário.
- Filtros temporais validados no servidor.
- Logs de acesso e operações com data, hora e usuário responsável.

## Convenções propostas

- Respostas com payload consistente e códigos HTTP semânticos.
- Erros de domínio desacoplados da tecnologia de transporte.
- Paginação e filtros sempre explícitos em query params.
- Recursos analíticos separados dos recursos transacionais quando necessário.

## Próximos passos

1. Definir contratos mínimos da Sprint 1.
2. Criar documentação de endpoints por módulo.
3. Padronizar formato de erro e metadados de paginação.
