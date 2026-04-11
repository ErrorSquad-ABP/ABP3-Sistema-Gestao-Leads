# API REST

## Direcao inicial

A API sera uma aplicacao `NestJS` separada, orientada a recursos, com versionamento por prefixo e contratos explicitos entre `front` e `back`.

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

- JWT obrigatorio para rotas protegidas.
- RBAC aplicado no backend conforme papel do usuario.
- Filtros temporais validados no servidor.
- Logs de acesso e operacoes com data, hora e usuario responsavel.
- Comunicacao com o frontend exclusivamente por `HTTP/JSON`.

## Convencoes propostas

- Respostas com payload consistente e codigos HTTP semanticos.
- Erros de dominio desacoplados da tecnologia de transporte.
- Paginacao e filtros sempre explicitos em query params.
- Recursos analiticos separados dos recursos transacionais quando necessario.
- Controllers do Nest funcionando apenas como adaptacao HTTP, sem concentrar regra de negocio.
- Decorators do Nest usados para roteamento, documentacao e composicao dos contratos da API.
- Swagger disponivel para documentacao tecnica inicial da API.

## Estado atual da Sprint 1

- `teams` possui CRUD inicial administrativo com `POST`, `GET`, `GET :id`, `PATCH :id` e `DELETE :id`.
- `stores` possui CRUD inicial administrativo com `POST`, `GET`, `GET :id`, `PATCH :id` e `DELETE :id`.
- Os endpoints de `PATCH` em `teams` e `stores` aceitam atualizacao parcial e retornam `400` quando nenhum campo e enviado.
- `teams` valida previamente `managerId` e `storeId`, aceitando apenas usuarios com papel compativel com gerencia e lojas existentes para fechar o vinculo organizacional basico.
- `stores` retorna conflito de negocio ao tentar excluir loja ainda vinculada a leads.

## Proximos passos

1. Definir contratos minimos da Sprint 1.
2. Criar documentacao de endpoints por modulo.
3. Padronizar formato de erro e metadados de paginacao.
