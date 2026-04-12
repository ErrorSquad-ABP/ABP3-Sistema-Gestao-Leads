# Guia prático: implementação alinhada ao repositório (Sprint 1)

## Propósito

Orientar o backend **no padrão já adotado** neste monorepo: NestJS, **Prisma**, **Argon2**, guard de autenticação **global**, módulos em `back/src/modules/*`, **use cases** na camada de aplicação, envelope de resposta `{ success, message, data, errors }`.

Este guia **não** prescreve TypeORM, bcrypt, `JwtAuthGuard` por controller, nem prefixo `/api/v1` em todos os recursos.

**Contratos HTTP**: [endpoints-sprint-1.md](./endpoints-sprint-1.md) + OpenAPI em `/api/docs-json`.

---

## 1. Roadmap (estado e próximos passos)

### Fase A — Autenticação e sessão (`US-01`)

| Endpoint | Estado | Notas |
| --- | --- | --- |
| `POST /api/auth/login` | Implementado | Cookies HttpOnly + JSON com `user` e `accessToken` |
| `POST /api/auth/refresh` | Implementado | Rotação de refresh opaco |
| `POST /api/auth/logout` | Implementado | `204`, revoga sessão |
| `GET /api/auth/me` | Implementado | Utilizador atual |

### Fase B — Credenciais do próprio utilizador (`US-02`)

| Item | Estado |
| --- | --- |
| Rota dedicada (ex. alterar e-mail/senha autenticado) | **Pendente** — ver gap em [endpoints-sprint-1.md](./endpoints-sprint-1.md) |

### Fase C — RBAC (`US-03`)

| Item | Implementação |
| --- | --- |
| Autenticação global | `GlobalAuthGuard` + `@Public()` onde for público |
| Papéis | `@Roles('ADMINISTRATOR', ...)` com enum canónico em `shared/domain/enums/user-role.enum.ts` |
| JWT | Payload com `userId` e `role` (ver `JwtUser` / login use case) |

### Fase D — CRUD utilizadores (`US-04`)

| Método | Rota | Notas |
| --- | --- | --- |
| `POST` | `/api/users` | Hoje: `@Roles('ADMINISTRATOR')` |
| `GET` | `/api/users` | Query `page`, `limit` |
| `GET` | `/api/users/:id` | |
| `PATCH` | `/api/users/:id` | Não usar `PUT` como padrão do projeto para este recurso |
| `DELETE` | `/api/users/:id` | `204` |

### Fase E — Equipas, lojas, clientes (`US-05`, `US-06`)

Controllers HTTP **ainda não** existem; seguir a mesma estrutura de módulo ao implementar.

### Fase F — Leads (`US-07`)

Implementado com rotas em `LeadController`: criação, listas por `owner` e por `team`, detalhe, `PATCH`, reatribuir, converter, `DELETE`. Ver código e [endpoints-sprint-1.md](./endpoints-sprint-1.md).

---

## 2. Checklist de validação

### Funcional

- [ ] Método HTTP e path coincidem com OpenAPI.
- [ ] Validação com `class-validator` nos validators do módulo.
- [ ] Respostas com corpo respeitam o envelope global.
- [ ] `204` sem corpo onde aplicável.

### Segurança

- [ ] Senhas apenas como hash **Argon2** (ver fluxo de criação/atualização de utilizador).
- [ ] Endpoints sensíveis não são `@Public()` por engano.
- [ ] CORS e cookies: `credentials: true` no front quando usar cookies.

### Paginação

- [ ] Listagens paginadas usam **`page` / `limit`** (como `GET /api/users`), não `offset`/`limit`, salvo decisão explícita futura.

### Integração

- [ ] Erros consumíveis pelo front via `success: false` e array `errors` com `code` estável.

---

## 3. Estrutura de módulo (referência)

```
back/src/modules/<nome>/
  application/
    use-cases/          ← casos de uso (orquestração)
    dto/                ← opcional
  domain/
    entities/
    errors/
  infrastructure/       ← Prisma, serviços técnicos
  presentation/
    controllers/
    validators/         ← DTOs de entrada Nest + class-validator
    presenters/         ← mapeamento para resposta
  <nome>.module.ts
```

Nomes no plural quando o módulo já existir (ex.: `modules/users`).

---

## 4. Exemplo de controller (padrão atual)

- Não é obrigatório `@UseGuards(JwtAuthGuard)` em cada classe: o guard é **global**.
- Use `@Public()` em rotas abertas.
- Use `@Roles(...)` quando o handler exigir papel.

```typescript
// Exemplo ilustrativo — ver users/lead controllers reais
@Controller('recurso')
class RecursoController {
  @Public()
  @Get('publico')
  publico() {
    return { ok: true };
  }

  @Get('privado')
  privado(@CurrentUser() user: JwtUser) {
    return { userId: user.userId };
  }
}
```

---

## 5. Testes

- Testes unitários dos use cases (mocks dos ports / Prisma onde fizer sentido).
- Testes do guard global e mapeamento de erros em `*.spec.ts` já existentes como referência.

---

## 6. Documentação de saída

1. Atualizar decorators Swagger nos controllers.
2. Atualizar [endpoints-sprint-1.md](./endpoints-sprint-1.md) quando o contrato mudar.
3. Garantir que `/api/docs-json` reflete a realidade antes de QA/front usar como referência.

---

## Links

- [endpoints-sprint-1.md](./endpoints-sprint-1.md)
- [traceability-endpoints-to-requirements.md](./traceability-endpoints-to-requirements.md)
- [backend-module-structure.md](../architecture/backend-module-structure.md)

**Versão**: 2.0  
**Atualizado em**: 2026-04-09
