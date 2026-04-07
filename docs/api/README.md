# API REST

## Direção inicial

A API será uma aplicação `NestJS` separada, orientada a recursos, com versionamento por prefixo e contratos explícitos entre `front` e `back`.

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
- Comunicação com o frontend exclusivamente por `HTTP/JSON`.

## Convenções propostas

- Respostas com payload consistente e códigos HTTP semânticos.
- Erros de domínio desacoplados da tecnologia de transporte.
- Paginação e filtros sempre explícitos em query params.
- Recursos analíticos separados dos recursos transacionais quando necessário.
- Controllers do Nest funcionando apenas como adaptação HTTP, sem concentrar regra de negócio.
- Decorators do Nest usados para roteamento, documentação e composição dos contratos da API.
- Swagger disponível para documentação técnica inicial da API.

## Documentação de Endpoints

### 🚀 Comece Por Aqui

**[SPRINT-1-ENDPOINTS-SUMMARY.md](./SPRINT-1-ENDPOINTS-SUMMARY.md)** — Sumário visual com links rápidos, visão geral de todos os 31 endpoints e roteiro para backend/frontend.

### Sprint 1 — Documentação Detalhada

- **[Contratos Mínimos de Endpoints da Sprint 1](./endpoints-sprint-1.md)** — Especificação completa dos endpoints necessários para US-01 a US-07, com:
  - Métodos HTTP e rotas
  - Contratos de requisição e resposta
  - Códigos de status HTTP
  - Autenticação e autorização requerida
  - Validações e restrições
  - Tratamento de erros padrão

- **[Rastreabilidade: Endpoints → User Stories → Requisitos](./traceability-endpoints-to-requirements.md)** — Mapa de rastreabilidade que vincula:
  - Endpoints aos requisitos funcionais (RF) e não-funcionais (RNF)
  - User stories às dependências e sequência de implementação
  - Checklist de alinhamento técnico para frontend, backend e revisão

- **[Guia Prático: Implementação de Endpoints da Sprint 1](./implementation-guide-sprint-1.md)** — Roteiro executável para o time de backend:
  - Roadmap de implementação com fases e estimativas
  - Checklist de validação por endpoint
  - Padrão de implementação recomendado (NestJS + DDD)
  - Ordem recomendada de execução
  - Testes unitários e integração
  - Checklist final da sprint

Baseado em: `US-01`, `US-02`, `US-03`, `US-04`, `US-05`, `US-06`, `US-07`

### Sprints futuras

- [Endpoint documentation for Sprint 2 (em desenvolvimento)]
- [Endpoint documentation for Sprint 3 (em desenvolvimento)]

## Próximos passos

1. ✅ Definir contratos mínimos da Sprint 1 — [Consultar endpoints-sprint-1.md](./endpoints-sprint-1.md)
2. Implementar controllers e endpoints conforme contratos
3. Integrar Swagger com decorators do NestJS para documentação automática
4. Validar contratos com frontend e time técnico
5. Criar documentação de endpoints por módulo (iterativo com desenvolvimento)
