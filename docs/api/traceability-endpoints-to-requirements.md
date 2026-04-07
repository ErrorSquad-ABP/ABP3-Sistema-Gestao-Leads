# Rastreabilidade: Endpoints → User Stories → Requisitos

## Propósito

Manter a rastreabilidade entre:
- **Endpoints**: rotas HTTP mínimas definidas para a Sprint 1
- **User Stories**: histórias de usuário que justificam cada endpoint
- **Requisitos Funcionais (RF)**: requisitos do enunciado do ABP
- **Requisitos Não-Funcionais (RNF)**: requisitos técnicos e arquiteturais
- **Entregáveis**: saídas esperadas de cada US

Facilita:
1. Alinhamento entre frontend, backend e revisão técnica
2. Validação de cobertura de requisitos
3. Priorização e sequência de implementação
4. Identificação de gaps ou extras

---

## Mapa de Rastreabilidade

### Épico: EP-01 — Identidade e Acesso

#### US-01: Implementar autenticação por e-mail e senha com JWT

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | `POST /api/v1/auth/login` |
| **Requisitos Funcionais** | `RF01` (autenticação com JWT) |
| **Requisitos Não-Funcionais** | `RNF02` (segurança), `RNF12` (camadas) |
| **Saída Esperada** | Endpoint de login + emissão de JWT com userId, role, expiração + hash seguro de senha |
| **Context Principal** | Sem autenticação não existe fluxo protegido |
| **Critério de Aceite Mínimo** | Usuário consegue fazer login e recebe token JWT válido |
| **Dependências** | Modelagem de usuários no banco + variáveis de ambiente |

---

#### US-02: Permitir atualização do próprio e-mail e da própria senha

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | `PUT /api/v1/auth/credentials` |
| **Requisitos Funcionais** | `RF01` (atualização de credenciais) |
| **Requisitos Não-Funcionais** | `RNF02` (segurança), `RNF05` (tratamento de alteração crítica) |
| **Saída Esperada** | Rota protegida para atualização + validação de senha atual + atualização segura com auditoria futura |
| **Context Principal** | Evita dependência de ações administrativas para manutenção de acesso |
| **Critério de Aceite Mínimo** | Usuário autenticado consegue atualizar seu e-mail e/ou senha com validação |
| **Dependências** | US-01 (autenticação) |

---

#### US-03: Implementar RBAC no backend para todos os perfis

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | (Transversal) Guards/Policies em todos os endpoints protegidos |
| **Requisitos Funcionais** | `RF02` (RBAC para ADMIN, MANAGER_GERAL, MANAGER, ATTENDANT) |
| **Requisitos Não-Funcionais** | `RNF02` (autorização backend), `RNF11` (padrão arquitetural), `RNF12` (camadas), `RNF13` (SRP) |
| **Saída Esperada** | Guards/Policies + restrição por papel e escopo + reaproveitamento entre módulos |
| **Context Principal** | Praticamente todo o restante depende disso |
| **Critério de Aceite Mínimo** | Endpoints respeitam papéis: ADMIN acessa dados completos, ATTENDANT vê apenas seus dados |
| **Dependências** | US-01 (token JWT com papel) |

---

### Épico: EP-02 — Estrutura Organizacional

#### US-04: Criar módulo de usuários

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | `POST /api/v1/users`<br/>`GET /api/v1/users`<br/>`GET /api/v1/users/:id`<br/>`PUT /api/v1/users/:id`<br/>`DELETE /api/v1/users/:id` |
| **Requisitos Funcionais** | `RF02` (CRUD com autorização) |
| **Requisitos Não-Funcionais** | `RNF02` (segurança), `RNF05` (integridade referencial), `RNF12` (camadas) |
| **Saída Esperada** | CRUD administrativo de usuários com validação de role, team, store |
| **Context Principal** | Base para atribuição de responsabilidades e rastreabilidade |
| **Critério de Aceite Mínimo** | Administrator consegue criar, listar, editar e deletar usuários |
| **Dependências** | US-01 (autenticação), US-03 (RBAC) |

---

#### US-05: Criar módulo de equipes e lojas

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | `POST /api/v1/teams`<br/>`GET /api/v1/teams`<br/>`GET /api/v1/teams/:id`<br/>`PUT /api/v1/teams/:id`<br/>`POST /api/v1/stores`<br/>`GET /api/v1/stores`<br/>`GET /api/v1/stores/:id`<br/>`PUT /api/v1/stores/:id` |
| **Requisitos Funcionais** | `RF02` (CRUD com autorização) |
| **Requisitos Não-Funcionais** | `RNF02` (segurança), `RNF05` (integridade referencial), `RNF12` (camadas) |
| **Saída Esperada** | CRUD de equipes e lojas + vínculo com usuários |
| **Context Principal** | Sustenta a hierarquia organizacional (loja → equipe → usuário) |
| **Critério de Aceite Mínimo** | Administrator consegue criar e gerenciar lojas; Manager_Geral consegue gerenciar equipes de sua loja |
| **Dependências** | US-01 (autenticação), US-03 (RBAC) |

---

### Épico: EP-03 — Clientes e Leads

#### US-06: Criar módulo de clientes

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | `POST /api/v1/customers`<br/>`GET /api/v1/customers`<br/>`GET /api/v1/customers/:id`<br/>`PUT /api/v1/customers/:id` |
| **Requisitos Funcionais** | `RF02` (CRUD com autorização) |
| **Requisitos Não-Funcionais** | `RNF02` (segurança), `RNF05` (integridade referencial), `RNF12` (camadas) |
| **Saída Esperada** | Entidade de cliente + persistência + rotas para cadastro e manutenção conforme escopo |
| **Context Principal** | Base para vínculo com leads (cliente → lead) |
| **Critério de Aceite Mínimo** | Usuário autorizado consegue criar e editar clientes sua loja |
| **Dependências** | US-01 (autenticação), US-03 (RBAC), US-05 (lojas) |

---

#### US-07: Implementar cadastro, listagem e edição de leads com vínculo completo

| Dimensão | Descrição |
| --- | --- |
| **Endpoints** | `POST /api/v1/leads`<br/>`GET /api/v1/leads`<br/>`GET /api/v1/leads/:id`<br/>`PUT /api/v1/leads/:id` |
| **Requisitos Funcionais** | `RF02` (CRUD com autorização e escopo), `RF04` (dados para dashboard operacional) |
| **Requisitos Não-Funcionais** | `RNF02` (segurança), `RNF05` (integridade transacional), `RNF12` (camadas) |
| **Saída Esperada** | CRUD de leads + associação a cliente, origem, loja e atendente + dados prontos para dashboards |
| **Context Principal** | Coração operacional do produto; base para negociações e dashboards |
| **Critério de Aceite Mínimo** | Atendente consegue criar leads; Manager vê leads de sua equipe; Manager_Geral vê leads de sua loja; ADMIN vê todos |
| **Dependências** | US-01 (autenticação), US-03 (RBAC), US-04 (usuários), US-05 (lojas), US-06 (clientes) |

---

## Matriz de Requisitos Funcionais

| RF | Descrição | US vinculadas | Endpoints vinculados |
| --- | --- | --- | --- |
| `RF01` | Autenticação com JWT + atualização de credenciais | US-01, US-02 | `POST /auth/login`, `PUT /auth/credentials` |
| `RF02` | RBAC para 4 papéis (ADMIN, MANAGER_GERAL, MANAGER, ATTENDANT) | US-03, US-04, US-05, US-06, US-07 | Todos (transversal) |
| `RF03` | Gestão de negociações (não é Sprint 1) | US-09, US-10 | — |
| `RF04` | Dashboard operacional com filtros | US-07 | `/leads` (dados base) |
| `RF05` | Dashboard analítico | US-11, US-12, US-13 | — |
| `RF06` | Filtros temporais customizados | US-05, US-06, US-07, US-11, US-12 | `/leads`, `/customers` (com query params) |
| `RF07` | Logs e auditoria | US-01 a US-07 (transversal futuro) | — |

---

## Matriz de Requisitos Não-Funcionais

| RNF | Descrição | US vinculadas | Contratos afetados |
| --- | --- | --- | --- |
| `RNF01` | Separação frontend/backend, API REST, modularidade | Todas | Todos endpoints |
| `RNF02` | Segurança: hash, JWT, middleware, variáveis de ambiente | US-01, US-02, US-03, US-04, US-05, US-06, US-07 | Autenticação, autorização, validação |
| `RNF03` | Consultas otimizadas | US-07 (leads) | GET `/leads` com paginação |
| `RNF04` | Interface responsiva | Frontend (não endpoint) | — |
| `RNF05` | Integridade referencial, transações, exceções | US-04, US-05, US-06, US-07 | FK constraints, tratamento de erro |
| `RNF06` | Documentação completa | Todas | Contrato em `endpoints-sprint-1.md` |
| `RNF11` | Padrão arquitetural reconhecido | US-03 (RBAC) | Guards/Policies design |
| `RNF12` | Camadas: presentation, application, domain, data | Todas | Controllers adaptam HTTP; regra de negócio em services/use-cases |
| `RNF13` | SRP, baixo acoplamento, alta coesão | Todas | Cada módulo responsável por seu domínio |

---

## Dependências e Sequência de Implementação

```
Banco & Modelagem (US-01 a US-07)
    ↓
US-01: Autenticação JWT
    ↓
US-02: Atualização de credenciais (depende de US-01)
    ↓
US-03: RBAC (depende de US-01)
    ↓
    ├─→ US-04: Usuários (depende de US-01, US-03)
    ├─→ US-05: Equipes & Lojas (depende de US-01, US-03)
    │       ↓
    │       └─→ US-06: Clientes (depende de US-01, US-03, US-05)
    │               ↓
    │               └─→ US-07: Leads (depende de todas as anteriores)
    │
    └─→ Frontend Integração (depende de US-01 a US-07 prontos)
```

---

## Checklist de Alinhamento Técnico

### Antes da implementação

- [ ] Frontend revisa contratos em `endpoints-sprint-1.md` e valida necessidades
- [ ] Backend revisa contratos e estima esforço de implementação
- [ ] Arquiteto valida aderência a padrão DDD + Clean Architecture
- [ ] Time técnico alinha dúvidas sobre RBAC e escopo de dados
- [ ] Time valida modelagem relacional (DER) com os contratos

### Durante a implementação

- [ ] Cada PR implementa endpoints conforme contrato
- [ ] Tests unitários cobrem lógica de RBAC
- [ ] Tests de integração cobrem fluxos end-to-end (login → recurso protegido)
- [ ] Validações de negócio estão na camada de aplicação/domínio
- [ ] Controllers funcionam apenas como adaptação HTTP

### Após a implementação

- [ ] Frontend testa consumo dos endpoints conforme contratos
- [ ] Swagger/OpenAPI reflete contratos definidos
- [ ] Documentação atualizada no repositório
- [ ] Revisão técnica valida segurança e aderência a RNF
- [ ] Testes de integração passam completos

---

## Referências Cruzadas

- **Product Backlog**: [docs/agile/product-backlog.md](../agile/product-backlog.md)
- **Sprint 1 Backlog**: [docs/agile/sprint-1-backlog.md](../agile/sprint-1-backlog.md)
- **Contratos Endpoints**: [docs/api/endpoints-sprint-1.md](./endpoints-sprint-1.md)
- **Arquitetura DDD**: [docs/architecture/ddd-clean-architecture.md](../architecture/ddd-clean-architecture.md)
- **Backend Structure**: [docs/architecture/backend-module-structure.md](../architecture/backend-module-structure.md)

---

**Versão**: 1.0  
**Data**: 2025-04-06  
**Mantido por**: Time de Backend e Arquitetura  
**Status**: Documento vivo — atualizar conforme refinamentos na sprint
