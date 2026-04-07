# Guia Prático: Implementação de Endpoints da Sprint 1

## Propósito

Guia rápido e prático para o time de backend acompanhar a implementação dos endpoints da Sprint 1, com:
- Checklist de endpoints por US
- Ordem de implementação recomendada
- Checklist de validação
- Links para documentação detalhada

---

## 1. Roadmap de Implementação

### Fase 1: Fundação — Autenticação (US-01, US-02)

| Item | Endpoint | Status | Descrição |
| --- | --- | --- | --- |
| 1.1 | `POST /api/v1/auth/login` | ⏳ | Autentica com e-mail/senha, emite JWT |
| 1.2 | `PUT /api/v1/auth/credentials` | ⏳ | Atualiza e-mail/senha do próprio usuário |

**Dependências**:
- Modelagem de User no banco
- JWT strategy no NestJS
- Hash seguro de senha (bcrypt)

**Estimativa**: 2-3 dias

---

### Fase 2: Autorização — RBAC (US-03)

| Item | Componente | Status | Descrição |
| --- | --- | --- | --- |
| 2.1 | Guards/Decorators | ⏳ | @UseGuards(JwtAuthGuard), @Roles(ADMIN, ...) |
| 2.2 | Middleware/Pipes | ⏳ | Validar token e papel em cada rota |
| 2.3 | Scope de dados | ⏳ | Filtros por ATTENDANT, MANAGER, MANAGER_GERAL, ADMIN |

**Dependências**:
- US-01 (JWT)
- Guards e strategies NestJS

**Estimativa**: 2-3 dias

---

### Fase 3: Módulos CRUD (US-04, US-05, US-06, US-07)

#### 3.1 User Module (US-04)

| Endpoint | HTTP | Status | Descrição |
| --- | --- | --- | --- |
| `/users` | `POST` | ⏳ | Criar usuário administrativo |
| `/users` | `GET` | ⏳ | Listar usuários (com RBAC) |
| `/users/:id` | `GET` | ⏳ | Obter detalhes de usuário |
| `/users/:id` | `PUT` | ⏳ | Atualizar usuário |
| `/users/:id` | `DELETE` | ⏳ | Deletar usuário |

**Estimativa**: 3-4 dias

---

#### 3.2 Team & Store Modules (US-05)

| Recurso | Endpoint | HTTP | Status | Descrição |
| --- | --- | --- | --- | --- |
| **Teams** | `/teams` | `POST` | ⏳ | Criar equipe |
| | `/teams` | `GET` | ⏳ | Listar equipes |
| | `/teams/:id` | `GET` | ⏳ | Obter equipe |
| | `/teams/:id` | `PUT` | ⏳ | Atualizar equipe |
| **Stores** | `/stores` | `POST` | ⏳ | Criar loja |
| | `/stores` | `GET` | ⏳ | Listar lojas |
| | `/stores/:id` | `GET` | ⏳ | Obter loja |
| | `/stores/:id` | `PUT` | ⏳ | Atualizar loja |

**Estimativa**: 3-4 dias

---

#### 3.3 Customer Module (US-06)

| Endpoint | HTTP | Status | Descrição |
| --- | --- | --- | --- |
| `/customers` | `POST` | ⏳ | Criar cliente |
| `/customers` | `GET` | ⏳ | Listar clientes |
| `/customers/:id` | `GET` | ⏳ | Obter cliente |
| `/customers/:id` | `PUT` | ⏳ | Atualizar cliente |

**Estimativa**: 3-4 dias

---

#### 3.4 Lead Module (US-07)

| Endpoint | HTTP | Status | Descrição |
| --- | --- | --- | --- |
| `/leads` | `POST` | ⏳ | Criar lead |
| `/leads` | `GET` | ⏳ | Listar leads (com escopo) |
| `/leads/:id` | `GET` | ⏳ | Obter lead detalhes |
| `/leads/:id` | `PUT` | ⏳ | Atualizar lead |

**Estimativa**: 4-5 dias

---

## 2. Checklist de Validação por Endpoint

### Validação Funcional

- [ ] Endpoint responde no método HTTP correto
- [ ] Request é validada e rejeita payloads inválidos (HTTP 400)
- [ ] Request válido é processado e retorna resposta conforme contrato
- [ ] Response usa códigos HTTP semanticamente corretos (200, 201, 400, 401, 403, 404)
- [ ] Response body segue formato JSON definido em `endpoints-sprint-1.md`

### Validação de Autenticação & Autorização

- [ ] Endpoints públicos (ex: `POST /auth/login`) não exigem JWT
- [ ] Endpoints protegidos retornam HTTP 401 se JWT ausente ou inválido
- [ ] Endpoints protegidos retornam HTTP 403 se JWT válido mas sem autorização (role/escopo)
- [ ] RBAC é validado **no backend**, não no frontend

### Validação de Segurança

- [ ] Senhas são armazenadas com hash seguro (bcrypt, não plaintext)
- [ ] JWTs incluem `userId`, `role`, expiração
- [ ] Endpoints administrativos bloqueiam usuários sem papel apropriado
- [ ] Queries não expõem dados além do escopo do usuário (ATTENDANT vê só por si mesmo, etc.)

### Validação de Dados

- [ ] E-mails são validados quanto formato
- [ ] UUIDs são validados quanto formato v4
- [ ] Senhas cumprem requisitos mínimos (8+ caracteres)
- [ ] Campos obrigatórios são rejeitados se ausentes
- [ ] Campos únicos (email, cpfCnpj) rejeitam duplicatas

### Validação de Paginação

- [ ] Endpoints com `GET /patients` suportam `offset` e `limit`
- [ ] Response inclui `pagination` com `offset`, `limit`, `total`
- [ ] Padrão recomendado: `offset=0, limit=10` se não especificado

### Validação de Integração

- [ ] Endpoints testados contra frontend (consumo HTTP/JSON)
- [ ] Erros retornam formato consistente (vide `endpoints-sprint-1.md`)
- [ ] Frontend consegue parsear respostas sem surpresas

---

## 3. Ordem Recomendada de Implementação

### Sprint 1 — Semana de X a Y

```
Dia 1-2 (Fase 1): Autenticação
  └─ POST /auth/login
  └─ PUT /auth/credentials
  └─ Testes de login/credenciais

Dia 3-4 (Fase 2): RBAC
  └─ Guards, Decorators, Middleware
  └─ Validação de token em rotas
  └─ Testes de autorização

Dia 5 (Fase 3.1): User Module
  └─ POST /users (criar usuário)
  └─ GET /users (listar com RBAC)
  └─ GET /users/:id
  └─ PUT /users/:id
  └─ DELETE /users/:id

Dia 6-7 (Fase 3.2-3.3): Teams, Stores, Customers
  └─ Módulos CRUD em paralelo
  └─ Testes de escopo de dados

Dia 8-9 (Fase 3.4): Leads
  └─ Lead CRUD com escopo completo
  └─ Testes de fluxos de criação/edição

Dia 10 (Integração & Refinamento)
  └─ Testes end-to-end frontend+backend
  └─ Ajustes finais e documentação
  └─ Revisão técnica
```

---

## 4. Padrão de Implementação Recomendado

### Estrutura por Módulo (NestJS)

```
src/
  modules/
    user/
      presentation/
        user.controller.ts       ← Adaptação HTTP
        user.dtos.ts             ← InputDTO, OutputDTO
      application/
        services/
          create-user.service.ts ← Use case de criação
          list-users.service.ts  ← Use case de listagem
      domain/
        entities/
          user.entity.ts         ← User do domínio
        repositories/
          user.repository.ts     ← Interface (contrato)
      infrastructure/
        repositories/
          user.repository.impl.ts ← Implementação com TypeORM
      user.module.ts            ← Integração do módulo
```

### Padrão de Controller

```typescript
// user.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'shared/guards/jwt-auth.guard';
import { Roles } from 'shared/decorators/roles.decorator';
import { Role } from 'shared/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER_GERAL)
  async create(@Body() dto: CreateUserDTO) {
    return this.createUserService.execute(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER_GERAL, Role.MANAGER)
  async list(@Query() query: ListUsersQueryDTO) {
    return this.createUserService.execute(query);
  }

  // ... outros endpoints
}
```

### Padrão de Service (Use Case)

```typescript
// create-user.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'domain/repositories/user.repository';
import { CreateUserDTO } from 'presentation/dtos/create-user.dto';

@Injectable()
export class CreateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserDTO): Promise<UserOutputDTO> {
    // 1. Validação (regra de negócio)
    if (await this.userRepository.findByEmail(input.email)) {
      throw new BadRequestException({ code: 'USER_EMAIL_DUPLICATE' });
    }

    // 2. Criar entidade
    const user = User.create({ ...input });

    // 3. Persistir
    await this.userRepository.save(user);

    // 4. Retornar DTO
    return UserMapper.toDTO(user);
  }
}
```

---

## 5. Checklist de Completude por US

### US-01: Autenticação

- [ ] POST `/auth/login` implementado
  - [ ] Valida e-mail e senha obrigatórios
  - [ ] Encontra usuário no banco
  - [ ] Valida senha com bcrypt
  - [ ] Emite JWT com userId, role, expiração
  - [ ] Retorna token e dados do usuário
- [ ] Teste end-to-end: usuário consegue fazer login

---

### US-02: Atualização de Credenciais

- [ ] PUT `/auth/credentials` implementado
  - [ ] Requer JWT válido (autenticado)
  - [ ] Valida senha atual antes de alterar
  - [ ] Permite atualização de e-mail (deve validar duplicata)
  - [ ] Permite atualização de senha (mínimo 8 caracteres)
  - [ ] Retorna usuário atualizado
- [ ] Teste: usuário consegue atualizar credenciais

---

### US-03: RBAC

- [ ] Guard JWT implementado (valida token)
- [ ] Decorador @Roles implementado (restringe por papel)
- [ ] Middleware valida escopo de dados (ATTENDANT vê só seu, MANAGER vê da equipe, etc.)
- [ ] Testes:
  - [ ] Rota sem JWT retorna 401
  - [ ] JWT com papel insuficiente retorna 403
  - [ ] Queries filtram por escopo do usuário

---

### US-04: User Module

- [ ] POST `/users` (criar)
  - [ ] Valida campos obrigatórios (email, name, password, role)
  - [ ] Hash de senha
  - [ ] Rejeita email duplicado
  - [ ] Apenas ADMIN/MANAGER_GERAL pueden criar
- [ ] GET `/users` (listar)
  - [ ] Paginação com offset/limit
  - [ ] ADMIN vê todos; MANAGER vê da equipe; ATTENDANT vê só a si
- [ ] GET `/users/:id` (detalhe)
- [ ] PUT `/users/:id` (editar)
- [ ] DELETE `/users/:id` (deletar, soft delete recomendado)

---

### US-05: Team & Store Modules

**Teams**:
- [ ] POST `/teams` (criar)
  - [ ] Valida name e storeId obrigatórios
  - [ ] Apenas ADMIN/MANAGER_GERAL
- [ ] GET `/teams` (listar com paginação)
- [ ] GET `/teams/:id` (detalhe)
- [ ] PUT `/teams/:id` (editar)

**Stores**:
- [ ] POST `/stores` (criar, apenas ADMIN)
  - [ ] Valida name obrigatório
- [ ] GET `/stores` (listar com paginação)
- [ ] GET `/stores/:id` (detalhe)
- [ ] PUT `/stores/:id` (editar, apenas ADMIN)

---

### US-06: Customer Module

- [ ] POST `/customers` (criar)
  - [ ] Valida name obrigatório
  - [ ] Valida e-mail (formato)
  - [ ] cpfCnpj deve ser único (se fornecido)
- [ ] GET `/customers` (listar com paginação)
  - [ ] Suporta query ?search=nome
  - [ ] Filtra por escopo do usuário
- [ ] GET `/customers/:id` (detalhe)
- [ ] PUT `/customers/:id` (editar)

---

### US-07: Lead Module

- [ ] POST `/leads` (criar)
  - [ ] Valida: customerId, origin, storeId, importance obrigatórios
  - [ ] Associa ao usuário autenticado como responsável
  - [ ] Status padrão: NEW
- [ ] GET `/leads` (listar com paginação)
  - [ ] Filtra por origin, importance, storeId, customerId
  - [ ] ATTENDANT vê só seus leads
  - [ ] MANAGER vê leads da equipe
  - [ ] MANAGER_GERAL vê leads da loja
  - [ ] ADMIN vê todos
- [ ] GET `/leads/:id` (detalhe com dados expandidos)
  - [ ] Inclui dados do customer, store, responsible user
- [ ] PUT `/leads/:id` (editar)
  - [ ] Permite atualizar origin, importance, description, contact info
  - [ ] Apenas responsável, MANAGER ou superior

---

## 6. Validações por Endpoint (Resumo)

Todos os endpoints devem:

1. **Autenticação**: Validar JWT (exceto `/auth/login`)
2. **Autorização**: Validar papel apropriado (RBAC)
3. **Input**: Validar tipos, formatos, obrigatoriedade
4. **Business Logic**: Validar regras de negócio (emails únicos, etc.)
5. **Output**: Retornar DTO conforme contrato
6. **Errors**: Retornar formato consistente (vide `endpoints-sprint-1.md`)

---

## 7. Testes Recomendados por Endpoint

Para cada endpoint, implementar:

### Unit Tests
```typescript
// user.service.spec.ts
describe('CreateUserService', () => {
  it('should create user with valid input', async () => { ... });
  it('should reject duplicate email', async () => { ... });
  it('should hash password securely', async () => { ... });
});
```

### Integration Tests
```typescript
// user.controller.spec.ts
describe('UserController (e2e)', () => {
  it('POST /users should create user', async () => { ... });
  it('GET /users should list users by RBAC', async () => { ... });
  it('DELETE /users/:id should reject non-ADMIN', async () => { ... });
});
```

---

## 8. Documentação de Saída

Após implementação, gerar:

1. ✅ **Swagger/OpenAPI**: decorators NestJS auto-geram docs
   ```typescript
   @ApiOperation({ summary: 'Create user' })
   @ApiResponse({ status: 201, type: UserDTO })
   ```

2. ✅ **Atualizar** [endpoints-sprint-1.md](./endpoints-sprint-1.md) se houver desvios
3. ✅ **README do módulo**: Instruções de uso
4. ✅ **Exemplos cURL/Postman**: Para testes manuais

---

## 9. Checklist Final da Sprint

- [ ] Todos os 5 módulos (Auth, User, Team, Store, Customer, Lead) têm endpoints implementados
- [ ] RBAC funciona em todos os endpoints (testes passam)
- [ ] Paginação implementada em GETs com múltiplos resultados
- [ ] Validações de input implementadas (tipos, obrigatoriedade, formatos)
- [ ] Erros retornam formato consistente
- [ ] Soft delete implementado para usuários/clientes
- [ ] Documentação no Swagger está atualizada
- [ ] Frontend consegue consumir todos os endpoints
- [ ] Testes unitários e integração com coverage > 80%
- [ ] Code review aprovado
- [ ] Deploy/Merge para main aprovado

---

## Links Úteis

- 📋 **Contratos Detalhados**: [endpoints-sprint-1.md](./endpoints-sprint-1.md)
- 🔗 **Rastreabilidade**: [traceability-endpoints-to-requirements.md](./traceability-endpoints-to-requirements.md)
- 📚 **Product Backlog**: [../../agile/product-backlog.md](../../agile/product-backlog.md)
- 🏗️ **Backend Architecture**: [../../architecture/backend-module-structure.md](../../architecture/backend-module-structure.md)

---

**Versão**: 1.0  
**Data**: 2025-04-06  
**Responsável**: Time de Backend  
**Status**: Ativo — Atualizar conforme progresso da sprint
