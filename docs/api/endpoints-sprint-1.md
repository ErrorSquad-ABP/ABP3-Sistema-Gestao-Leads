# Contratos Mínimos de Endpoints da Sprint 1

## Sumário

Documentação dos contratos de requisição e resposta dos endpoints mínimos necessários para a Sprint 1, baseados nas user stories `US-01` a `US-07`.

## Objetivo

Facilitar o alinhamento entre frontend, backend e revisão técnica, estabelecendo contratos explícitos de:
- Métodos HTTP e rotas;
- Estrutura de request (body, query params, headers);
- Estrutura de response (dados, metadados, códigos HTTP);
- Autenticação e autorização requerida;
- Validações e restrições esperadas.

## Convenções

- **Autenticação**: JWT obrigatório no header `Authorization: Bearer <token>`;
- **Resposta de sucesso**: HTTP 200 (GET, PUT, PATCH), 201 (POST);
- **Resposta de erro**: HTTP 400 (validação), 401 (autenticação), 403 (autorização), 404 (não encontrado), 500 (servidor);
- **Formato**: JSON em todos os contextos;
- **Timestamps**: ISO 8601 (UTC);
- **Paginação**: Implementada com offset/limit (opcional para endpoints mínimos).

---

## Auth Module (US-01, US-02)

### 1.1 POST `/api/v1/auth/login`

**User Story**: `US-01` - Implementar autenticação por e-mail e senha com JWT

**Descrição**: Autentica usuário com e-mail e senha, emitindo JWT.

**Autenticação**: Pública (sem JWT)

**Request**:
```json
{
  "email": "string (e-mail válido, obrigatório)",
  "password": "string (mínimo 8 caracteres, obrigatório)"
}
```

**Response (200 - Sucesso)**:
```json
{
  "accessToken": "string (JWT com userId, role, expiração)",
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "name": "string",
    "role": "enum (ADMIN, MANAGER, TEAM_MANAGER, ATTENDANT)"
  }
}
```

**Response (400 - Validação)**:
```json
{
  "error": "Invalid email or password",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

**Response (401 - Não autenticado)**:
```json
{
  "error": "User not found",
  "code": "AUTH_USER_NOT_FOUND"
}
```

---

### 1.2 PUT `/api/v1/auth/credentials`

**User Story**: `US-02` - Permitir atualização do próprio e-mail e da própria senha

**Descrição**: Atualiza e-mail e/ou senha do usuário autenticado.

**Autenticação**: JWT obrigatório

**Request**:
```json
{
  "currentPassword": "string (obrigatório para validação)",
  "email": "string (opcional, novo e-mail)",
  "newPassword": "string (opcional, mínimo 8 caracteres)"
}
```

**Response (200 - Sucesso)**:
```json
{
  "message": "Credentials updated successfully",
  "user": {
    "id": "string (UUID)",
    "email": "string (novo e-mail se atualizado)",
    "updatedAt": "string (ISO 8601)"
  }
}
```

**Response (400 - Validação)**:
```json
{
  "error": "Current password is incorrect",
  "code": "AUTH_INVALID_PASSWORD"
}
```

**Response (401 - Não autenticado)**:
```json
{
  "error": "JWT token invalid or expired",
  "code": "AUTH_TOKEN_INVALID"
}
```

---

## User Module (US-04)

### 2.1 POST `/api/v1/users`

**User Story**: `US-04` - Criar módulo de usuários

**Descrição**: Cria novo usuário no sistema (administrativo).

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN` ou `MANAGER_GERAL` apenas

**Request**:
```json
{
  "email": "string (único, e-mail válido, obrigatório)",
  "password": "string (mínimo 8 caracteres, obrigatório)",
  "name": "string (não vazio, obrigatório)",
  "role": "enum (ADMIN, MANAGER, TEAM_MANAGER, ATTENDANT, obrigatório)",
  "teamId": "string (UUID, opcional se ADMIN)",
  "storeId": "string (UUID, opcional)"
}
```

**Response (201 - Criado)**:
```json
{
  "id": "string (UUID)",
  "email": "string",
  "name": "string",
  "role": "enum",
  "teamId": "string (UUID ou null)",
  "storeId": "string (UUID ou null)",
  "createdAt": "string (ISO 8601)"
}
```

**Response (400 - Validação)**:
```json
{
  "error": "Email already exists",
  "code": "USER_EMAIL_DUPLICATE"
}
```

**Response (403 - Autorização)**:
```json
{
  "error": "Insufficient permissions",
  "code": "RBAC_FORBIDDEN"
}
```

---

### 2.2 GET `/api/v1/users`

**User Story**: `US-04` - Criar módulo de usuários

**Descrição**: Lista usuários (com restrição por RBAC).

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN` vê todos; `MANAGER_GERAL` vê da loja; `MANAGER` vê da equipe; `ATTENDANT` vê apenas a si mesmo

**Query Params**:
- `offset` (number, opcional, padrão 0)
- `limit` (number, opcional, padrão 10)
- `role` (enum, opcional - filtro)
- `teamId` (string UUID, opcional - filtro)

**Response (200 - Sucesso)**:
```json
{
  "data": [
    {
      "id": "string (UUID)",
      "email": "string",
      "name": "string",
      "role": "enum",
      "teamId": "string (UUID ou null)",
      "storeId": "string (UUID ou null)",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "offset": "number",
    "limit": "number",
    "total": "number"
  }
}
```

---

### 2.3 GET `/api/v1/users/:id`

**User Story**: `US-04` - Criar módulo de usuários

**Descrição**: Obtém detalhes de um usuário específico.

**Autenticação**: JWT obrigatório

**Autorização**: Próprio usuário, `MANAGER` da equipe ou superior

**Path Params**:
- `id` (string UUID, obrigatório)

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "email": "string",
  "name": "string",
  "role": "enum",
  "teamId": "string (UUID ou null)",
  "storeId": "string (UUID ou null)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Response (404 - Não encontrado)**:
```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

---

### 2.4 PUT `/api/v1/users/:id`

**User Story**: `US-04` - Criar módulo de usuários

**Descrição**: Atualiza dados de um usuário (administrativo).

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN`, `MANAGER_GERAL` ou gerenciador da equipe

**Path Params**:
- `id` (string UUID, obrigatório)

**Request**:
```json
{
  "name": "string (opcional)",
  "email": "string (opcional, deve ser único)",
  "role": "enum (opcional)",
  "teamId": "string (UUID, opcional)",
  "storeId": "string (UUID, opcional)"
}
```

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "email": "string",
  "name": "string",
  "role": "enum",
  "teamId": "string (UUID ou null)",
  "storeId": "string (UUID ou null)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 2.5 DELETE `/api/v1/users/:id`

**User Story**: `US-04` - Criar módulo de usuários

**Descrição**: Deleta um usuário (soft delete recomendado).

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN` ou `MANAGER_GERAL` apenas

**Path Params**:
- `id` (string UUID, obrigatório)

**Response (204 - Sem conteúdo)**:
- Sucesso sem corpo

**Response (403 - Autorização)**:
```json
{
  "error": "Cannot delete own account",
  "code": "USER_CANNOT_DELETE_SELF"
}
```

---

## Team Module (US-05)

### 3.1 POST `/api/v1/teams`

**User Story**: `US-05` - Criar módulo de equipes

**Descrição**: Cria nova equipe (estrutura organizacional).

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN` ou `MANAGER_GERAL` apenas

**Request**:
```json
{
  "name": "string (não vazio, obrigatório)",
  "storeId": "string (UUID, obrigatório)",
  "description": "string (opcional)"
}
```

**Response (201 - Criado)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "storeId": "string (UUID)",
  "description": "string (ou null)",
  "createdAt": "string (ISO 8601)"
}
```

---

### 3.2 GET `/api/v1/teams`

**User Story**: `US-05` - Criar módulo de equipes

**Descrição**: Lista equipes (com restrição por RBAC).

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN` vê todas; `MANAGER_GERAL` vê da loja; outros veem apenas a própria equipe

**Query Params**:
- `offset` (number, opcional)
- `limit` (number, opcional)
- `storeId` (string UUID, opcional - filtro)

**Response (200 - Sucesso)**:
```json
{
  "data": [
    {
      "id": "string (UUID)",
      "name": "string",
      "storeId": "string (UUID)",
      "description": "string (ou null)",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "offset": "number",
    "limit": "number",
    "total": "number"
  }
}
```

---

### 3.3 GET `/api/v1/teams/:id`

**User Story**: `US-05` - Criar módulo de equipes

**Descrição**: Obtém detalhes de uma equipe específica.

**Autenticação**: JWT obrigatório

**Path Params**:
- `id` (string UUID, obrigatório)

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "storeId": "string (UUID)",
  "description": "string (ou null)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 3.4 PUT `/api/v1/teams/:id`

**User Story**: `US-05` - Criar módulo de equipes

**Descrição**: Atualiza equipe.

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN` ou `MANAGER_GERAL` apenas

**Path Params**:
- `id` (string UUID, obrigatório)

**Request**:
```json
{
  "name": "string (opcional)",
  "description": "string (opcional)"
}
```

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "storeId": "string (UUID)",
  "description": "string (ou null)",
  "updatedAt": "string (ISO 8601)"
}
```

---

## Store Module (US-05)

### 4.1 POST `/api/v1/stores`

**User Story**: `US-05` - Criar módulo de lojas

**Descrição**: Cria nova loja (estrutura organizacional).

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN` apenas

**Request**:
```json
{
  "name": "string (não vazio, obrigatório)",
  "address": "string (opcional)",
  "city": "string (opcional)",
  "state": "string (opcional)",
  "cnpj": "string (opcional, deve ser único)"
}
```

**Response (201 - Criado)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "address": "string (ou null)",
  "city": "string (ou null)",
  "state": "string (ou null)",
  "cnpj": "string (ou null)",
  "createdAt": "string (ISO 8601)"
}
```

---

### 4.2 GET `/api/v1/stores`

**User Story**: `US-05` - Criar módulo de lojas

**Descrição**: Lista lojas.

**Autenticação**: JWT obrigatório

**Autorização**: Público para usuários autenticados

**Query Params**:
- `offset` (number, opcional)
- `limit` (number, opcional)

**Response (200 - Sucesso)**:
```json
{
  "data": [
    {
      "id": "string (UUID)",
      "name": "string",
      "address": "string (ou null)",
      "city": "string (ou null)",
      "state": "string (ou null)",
      "cnpj": "string (ou null)",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "offset": "number",
    "limit": "number",
    "total": "number"
  }
}
```

---

### 4.3 GET `/api/v1/stores/:id`

**User Story**: `US-05` - Criar módulo de lojas

**Descrição**: Obtém detalhes de uma loja.

**Autenticação**: JWT obrigatório

**Path Params**:
- `id` (string UUID, obrigatório)

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "address": "string (ou null)",
  "city": "string (ou null)",
  "state": "string (ou null)",
  "cnpj": "string (ou null)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 4.4 PUT `/api/v1/stores/:id`

**User Story**: `US-05` - Criar módulo de lojas

**Descrição**: Atualiza loja.

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN` apenas

**Path Params**:
- `id` (string UUID, obrigatório)

**Request**:
```json
{
  "name": "string (opcional)",
  "address": "string (opcional)",
  "city": "string (opcional)",
  "state": "string (opcional)",
  "cnpj": "string (opcional)"
}
```

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "address": "string (ou null)",
  "city": "string (ou null)",
  "state": "string (ou null)",
  "cnpj": "string (ou null)",
  "updatedAt": "string (ISO 8601)"
}
```

---

## Customer Module (US-06)

### 5.1 POST `/api/v1/customers`

**User Story**: `US-06` - Criar módulo de clientes

**Descrição**: Cria novo cliente.

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN`, `MANAGER_GERAL`, `MANAGER` ou `ATTENDANT` conforme escopo

**Request**:
```json
{
  "name": "string (não vazio, obrigatório)",
  "email": "string (e-mail válido, opcional)",
  "phone": "string (opcional)",
  "cpfCnpj": "string (opcional, único)",
  "address": "string (opcional)",
  "city": "string (opcional)",
  "state": "string (opcional)",
  "zipCode": "string (opcional)"
}
```

**Response (201 - Criado)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string (ou null)",
  "phone": "string (ou null)",
  "cpfCnpj": "string (ou null)",
  "address": "string (ou null)",
  "city": "string (ou null)",
  "state": "string (ou null)",
  "zipCode": "string (ou null)",
  "createdAt": "string (ISO 8601)",
  "createdBy": "string (UUID do usuário)"
}
```

---

### 5.2 GET `/api/v1/customers`

**User Story**: `US-06` - Criar módulo de clientes

**Descrição**: Lista clientes (com restrição por RBAC).

**Autenticação**: JWT obrigatório

**Autorização**: Retorna clientes conforme escopo do usuário

**Query Params**:
- `offset` (number, opcional)
- `limit` (number, opcional)
- `search` (string, opcional - busca por nome ou e-mail)

**Response (200 - Sucesso)**:
```json
{
  "data": [
    {
      "id": "string (UUID)",
      "name": "string",
      "email": "string (ou null)",
      "phone": "string (ou null)",
      "cpfCnpj": "string (ou null)",
      "city": "string (ou null)",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "offset": "number",
    "limit": "number",
    "total": "number"
  }
}
```

---

### 5.3 GET `/api/v1/customers/:id`

**User Story**: `US-06` - Criar módulo de clientes

**Descrição**: Obtém detalhes de um cliente.

**Autenticação**: JWT obrigatório

**Path Params**:
- `id` (string UUID, obrigatório)

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string (ou null)",
  "phone": "string (ou null)",
  "cpfCnpj": "string (ou null)",
  "address": "string (ou null)",
  "city": "string (ou null)",
  "state": "string (ou null)",
  "zipCode": "string (ou null)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "createdBy": "string (UUID)"
}
```

---

### 5.4 PUT `/api/v1/customers/:id`

**User Story**: `US-06` - Criar módulo de clientes

**Descrição**: Atualiza cliente.

**Autenticação**: JWT obrigatório

**Autorização**: Criador, `MANAGER` da loja ou `ADMIN`

**Path Params**:
- `id` (string UUID, obrigatório)

**Request**:
```json
{
  "name": "string (opcional)",
  "email": "string (opcional)",
  "phone": "string (opcional)",
  "address": "string (opcional)",
  "city": "string (opcional)",
  "state": "string (opcional)",
  "zipCode": "string (opcional)"
}
```

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string (ou null)",
  "phone": "string (ou null)",
  "cpfCnpj": "string (ou null)",
  "address": "string (ou null)",
  "city": "string (ou null)",
  "state": "string (ou null)",
  "zipCode": "string (ou null)",
  "updatedAt": "string (ISO 8601)"
}
```

---

## Lead Module (US-07)

### 6.1 POST `/api/v1/leads`

**User Story**: `US-07` - Implementar cadastro, listagem e edição de leads

**Descrição**: Cria novo lead com vínculo a cliente, origem, loja e atendente.

**Autenticação**: JWT obrigatório

**Autorização**: `ADMIN`, `MANAGER_GERAL`, `MANAGER`, `ATTENDANT` (preenche como responsável)

**Request**:
```json
{
  "customerId": "string (UUID, obrigatório)",
  "origin": "string (enum: PHONE, EMAIL, WHATSAPP, WEBSITE, REFERRAL, obrigatório)",
  "storeId": "string (UUID, obrigatório)",
  "importance": "string (enum: LOW, MEDIUM, HIGH, obrigatório)",
  "description": "string (opcional, notas iniciais)",
  "contactPhone": "string (opcional)",
  "contactEmail": "string (opcional)"
}
```

**Response (201 - Criado)**:
```json
{
  "id": "string (UUID)",
  "customerId": "string (UUID)",
  "origin": "string (enum)",
  "storeId": "string (UUID)",
  "importance": "string (enum)",
  "description": "string (ou null)",
  "contactPhone": "string (ou null)",
  "contactEmail": "string (ou null)",
  "responsibleUserId": "string (UUID - usuário autenticado)",
  "status": "enum (NEW)",
  "createdAt": "string (ISO 8601)"
}
```

---

### 6.2 GET `/api/v1/leads`

**User Story**: `US-07` - Implementar cadastro, listagem e edição de leads

**Descrição**: Lista leads (com restrição por RBAC e escopo de dados).

**Autenticação**: JWT obrigatório

**Autorização**:
- `ATTENDANT`: vê apenas seus próprios leads
- `MANAGER`: vê leads de sua equipe
- `MANAGER_GERAL`: vê leads de sua loja
- `ADMIN`: vê todos

**Query Params**:
- `offset` (number, opcional)
- `limit` (number, opcional)
- `origin` (enum, opcional - filtro)
- `importance` (enum, opcional - filtro)
- `storeId` (string UUID, opcional - filtro)
- `customerId` (string UUID, opcional - filtro)
- `status` (enum, opcional - filtro)

**Response (200 - Sucesso)**:
```json
{
  "data": [
    {
      "id": "string (UUID)",
      "customerId": "string (UUID)",
      "customerName": "string",
      "origin": "string (enum)",
      "storeId": "string (UUID)",
      "importance": "string (enum)",
      "description": "string (ou null)",
      "responsibleUserId": "string (UUID)",
      "responsibleUserName": "string",
      "status": "enum",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "offset": "number",
    "limit": "number",
    "total": "number"
  }
}
```

---

### 6.3 GET `/api/v1/leads/:id`

**User Story**: `US-07` - Implementar cadastro, listagem e edição de leads

**Descrição**: Obtém detalhes de um lead específico.

**Autenticação**: JWT obrigatório

**Autorização**: Próprio responsável, `MANAGER` da equipe ou superior

**Path Params**:
- `id` (string UUID, obrigatório)

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "customerId": "string (UUID)",
  "customerName": "string",
  "customerEmail": "string (ou null)",
  "customerPhone": "string (ou null)",
  "origin": "string (enum)",
  "storeId": "string (UUID)",
  "storeName": "string",
  "importance": "string (enum)",
  "description": "string (ou null)",
  "contactPhone": "string (ou null)",
  "contactEmail": "string (ou null)",
  "responsibleUserId": "string (UUID)",
  "responsibleUserName": "string",
  "status": "enum",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 6.4 PUT `/api/v1/leads/:id`

**User Story**: `US-07` - Implementar cadastro, listagem e edição de leads

**Descrição**: Atualiza lead.

**Autenticação**: JWT obrigatório

**Autorização**: Responsável, `MANAGER` da equipe ou superior

**Path Params**:
- `id` (string UUID, obrigatório)

**Request**:
```json
{
  "customerId": "string (UUID, opcional)",
  "origin": "string (enum, opcional)",
  "importance": "string (enum, opcional)",
  "description": "string (opcional)",
  "contactPhone": "string (opcional)",
  "contactEmail": "string (opcional)",
  "status": "string (enum, opcional)"
}
```

**Response (200 - Sucesso)**:
```json
{
  "id": "string (UUID)",
  "customerId": "string (UUID)",
  "customerName": "string",
  "origin": "string (enum)",
  "storeId": "string (UUID)",
  "storeName": "string",
  "importance": "string (enum)",
  "description": "string (ou null)",
  "contactPhone": "string (ou null)",
  "contactEmail": "string (ou null)",
  "responsibleUserId": "string (UUID)",
  "responsibleUserName": "string",
  "status": "enum",
  "updatedAt": "string (ISO 8601)"
}
```

---

## Enums e Constantes

### Roles (Papéis)

- `ADMIN`: Acesso total ao sistema
- `MANAGER_GERAL`: Gerente geral de loja
- `MANAGER`: Gerente de equipe
- `ATTENDANT`: Atendente/operacional

### Lead Origin

- `PHONE`: Telefonema
- `EMAIL`: E-mail
- `WHATSAPP`: WhatsApp
- `WEBSITE`: Website
- `REFERRAL`: Indicação

### Lead Importance

- `LOW`: Baixa
- `MEDIUM`: Média
- `HIGH`: Alta

### Lead Status (Mínimo para Sprint 1)

- `NEW`: Novo
- `IN_PROGRESS`: Em andamento
- `QUALIFIED`: Qualificado
- `LOST`: Perdido

---

## Tratamento de Erros Padrão

### 400 - Bad Request

```json
{
  "error": "string (descrição do erro de validação)",
  "code": "string (código de erro específico)",
  "details": {
    "field": "array (campos inválidos, opcional)"
  }
}
```

### 401 - Unauthorized

```json
{
  "error": "JWT token invalid or expired",
  "code": "AUTH_TOKEN_INVALID"
}
```

### 403 - Forbidden

```json
{
  "error": "Insufficient permissions for this operation",
  "code": "RBAC_FORBIDDEN"
}
```

### 404 - Not Found

```json
{
  "error": "Resource not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Notas de Implementação

1. **RBAC (Authorization)**: Todas as rotas devem validar autorização no backend. O frontend não deve ser ponto de segurança.

2. **Escopo de Dados**: Além da autorização de rota, aplicar filtros de escopo:
   - `ATTENDANT`: vê apenas seus dados
   - `MANAGER`: vê dados da equipe
   - `MANAGER_GERAL`: vê dados da loja
   - `ADMIN`: vê tudo

3. **Paginação**: Implementar com `offset` e `limit`. Padrão mínimo: 10 registros por página.

4. **Timestamps**: Sempre em UTC, formato ISO 8601 (ex: `2025-03-15T14:30:00Z`).

5. **Validações**:
   - E-mails: validar formato
   - Senhas: mínimo 8 caracteres
   - UUIDs: validar formato v4
   - Datas: ISO 8601

6. **Soft Delete**: Usuários e clientes podem usar soft delete (adicionar campo `deletedAt`).

7. **Idempotência**: Endpoints POST devem ser idempotentes (considerar implementar `idempotencyKey` opcional).

---

## Próximos Passos

- [ ] Implementar autenticação e JWT (US-01)
- [ ] Implementar atualização de credenciais (US-02)
- [ ] Implementar RBAC no backend (US-03)
- [ ] Implementar módulo de usuários (US-04)
- [ ] Implementar módulos de equipes e lojas (US-05)
- [ ] Implementar módulo de clientes (US-06)
- [ ] Implementar módulo de leads (US-07)
- [ ] Integrar frontend com estes contratos
- [ ] Documentar no Swagger/OpenAPI
- [ ] Revisar segurança e validações

---

## Rastreabilidade

| User Story | Endpoints | Status |
| --- | --- | --- |
| US-01 | POST `/auth/login` | Contrato definido |
| US-02 | PUT `/auth/credentials` | Contrato definido |
| US-03 | (Implementação transversal via RBAC) | Contrato estruturado |
| US-04 | POST/GET/PUT/DELETE `/users` | Contrato definido |
| US-05 | POST/GET/PUT `/teams`, POST/GET/PUT `/stores` | Contrato definido |
| US-06 | POST/GET/PUT `/customers` | Contrato definido |
| US-07 | POST/GET/PUT `/leads` | Contrato definido |

---

**Versão**: 1.0  
**Data**: 2025-04-06  
**Responsável pela documentação**: Time de Backend e Frontend  
**Status**: Contrato por revisar e validar
