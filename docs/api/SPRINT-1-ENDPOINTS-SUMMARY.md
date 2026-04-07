# 📋 Documentação da Sprint 1: Sumário Executivo

## 🎯 Objetivo da Documentação

Registrar os **contratos mínimos de endpoints** da Sprint 1 com base em **US-01 a US-07**, facilitando alinhamento entre:
- 👨‍💻 **Backend**: Sabe exatamente o que implementar
- 🎨 **Frontend**: Sabe exatamente como consumir
- 🔍 **Revisão Técnica**: Valida aderência a requisitos e padrões

---

## 📁 Estrutura de Documentação

```
docs/
  api/
    ├─ README.md                                  ← Índice principal (você está aqui)
    │
    ├─ 📄 endpoints-sprint-1.md                   ← CONTRATOS DETALHADOS
    │      └─ Especificação completa de cada endpoint
    │         • Métodos HTTP e rotas
    │         • Payloads de request/response
    │         • Códigos de status HTTP
    │         • Autenticação & autorização
    │         • Validações esperadas
    │         • 31 endpoints mapeados
    │
    ├─ 🔗 traceability-endpoints-to-requirements.md ← ALINHAMENTO
    │      └─ Matriz de rastreabilidade
    │         • Endpoints ← → US
    │         • US ← → RF/RNF (requisitos)
    │         • Dependências entre US
    │         • Sequência de implementação
    │         • Checklist de alinhamento técnico
    │
    ├─ 🛠️  implementation-guide-sprint-1.md       ← GUIA PRÁTICO
    │      └─ Roadmap executável para backend
    │         • Fases de implementação (1.0 a 3.4)
    │         • Checklist por endpoint
    │         • Padrões NestJS + DDD recomendados
    │         • Ordem de execução
    │         • Testes unitários & integração
    │         • Checklist final da sprint
    │
    └─ 📊 SPRINT-1-ENDPOINTS-SUMMARY.md          ← ESTE ARQUIVO
           └─ Sumário visual & links rápidos
```

---

## 🚀 Comece Por Aqui

### 1️⃣ **Para o Backend** → Implementar

👉 Comece com: **[Implementation Guide](./implementation-guide-sprint-1.md)**

1. Leia o **Roadmap de Implementação**
2. Implemente por **Fase** (1-3):
   - **Fase 1** (2-3 dias): Autenticação JWT
   - **Fase 2** (2-3 dias): RBAC
   - **Fase 3** (10-12 dias): Módulos CRUD
3. Use o **[Contrato Detalhado](./endpoints-sprint-1.md)** como referência
4. Valide com **Checklists** de cada US

---

### 2️⃣ **Para o Frontend** → Consumir

👉 Comece com: **[Contratos Detalhados](./endpoints-sprint-1.md)**

1. Leia a **Convenção de Requisição/Resposta**
2. Para cada tela que você vai implementar:
   - Encontre a **US** correspondente (US-01 a US-07)
   - Localize os **Endpoints** relacionados
   - Entenda o **Contrato** (campos, tipos, validações)
   - Teste com o backend

---

### 3️⃣ **Para Arquitetura/Revisão** → Validar

👉 Comece com: **[Rastreabilidade](./traceability-endpoints-to-requirements.md)**

1. Valide **Cobertura de Requisitos**
   - Todos os RF? Sim ✅
   - Todos os RNF? Sim ✅
2. Valide **Sequência de Dependências**
3. Use **Checklist de Alinhamento Técnico** ao revisar PRs

---

## 📊 Visão Geral dos Endpoints

### **Auth Module** (US-01, US-02)
| Endpoint | Método | Autenticação | Descrição |
| --- | --- | --- | --- |
| `/auth/login` | `POST` | ❌ Pública | Autenticação com e-mail/senha, emite JWT |
| `/auth/credentials` | `PUT` | ✅ JWT | Atualiza e-mail/senha do próprio usuário |

### **User Module** (US-04)
| Endpoint | Método | Autenticação | Descrição |
| --- | --- | --- | --- |
| `/users` | `POST` | ✅ JWT | Cria usuário (ADMIN/MANAGER_GERAL) |
| `/users` | `GET` | ✅ JWT | Lista com RBAC |
| `/users/:id` | `GET` | ✅ JWT | Detalhe |
| `/users/:id` | `PUT` | ✅ JWT | Atualiza |
| `/users/:id` | `DELETE` | ✅ JWT | Deleta (soft delete) |

### **Team Module** (US-05)
| Endpoint | Método | Autenticação | Descrição |
| --- | --- | --- | --- |
| `/teams` | `POST` | ✅ JWT | Cria equipe |
| `/teams` | `GET` | ✅ JWT | Lista com RBAC |
| `/teams/:id` | `GET` | ✅ JWT | Detalhe |
| `/teams/:id` | `PUT` | ✅ JWT | Atualiza |

### **Store Module** (US-05)
| Endpoint | Método | Autenticação | Descrição |
| --- | --- | --- | --- |
| `/stores` | `POST` | ✅ JWT | Cria loja (ADMIN) |
| `/stores` | `GET` | ✅ JWT | Lista |
| `/stores/:id` | `GET` | ✅ JWT | Detalhe |
| `/stores/:id` | `PUT` | ✅ JWT | Atualiza (ADMIN) |

### **Customer Module** (US-06)
| Endpoint | Método | Autenticação | Descrição |
| --- | --- | --- | --- |
| `/customers` | `POST` | ✅ JWT | Cria cliente |
| `/customers` | `GET` | ✅ JWT | Lista com paginação |
| `/customers/:id` | `GET` | ✅ JWT | Detalhe |
| `/customers/:id` | `PUT` | ✅ JWT | Atualiza |

### **Lead Module** (US-07)
| Endpoint | Método | Autenticação | Descrição |
| --- | --- | --- | --- |
| `/leads` | `POST` | ✅ JWT | Cria lead |
| `/leads` | `GET` | ✅ JWT | Lista com escopo (RBAC) |
| `/leads/:id` | `GET` | ✅ JWT | Detalhe |
| `/leads/:id` | `PUT` | ✅ JWT | Atualiza |

---

## 🔐 Segurança & RBAC

### Papéis (Roles)

| Papel | Acesso | Escopo |
| --- | --- | --- |
| **ADMIN** | Acesso total | Tudo |
| **MANAGER_GERAL** | Gerencial + operacional | Sua loja |
| **MANAGER** | Operacional | Sua equipe |
| **ATTENDANT** | Operacional | Seus dados |

### Regra Crítica

⚠️ **Autorização é feita NO BACKEND, nunca no frontend!**

- JWT obrigatório para rotas protegidas
- RBAC validado via Guards/Decorators
- Escopo de dados filtrado em queries
- Frontend pode orientar, mas backend valida

---

## 📈 Sequência de Implementação

```
┌─────────────────────────────────────┐
│  Banco & Modelagem (Pré-requisito)  │
└────────────────┬────────────────────┘
                 ↓
         ┌───────────────┐
         │ FASE 1: Auth  │ (2-3 dias)
         │ • JWT login   │
         │ • Credentials │
         └───────┬───────┘
                 ↓
         ┌───────────────┐
         │ FASE 2: RBAC  │ (2-3 dias)
         │ • Guards      │
         │ • Decorators  │
         │ • Scope       │
         └───────┬───────┘
                 ↓
     ┌───────────────────────────────────┐
     │   FASE 3: Módulos CRUD (10-12d)   │
     │  ┌─────────────────────────────┐  │
     │  │ 3.1: Users (3-4 dias)       │  │
     │  │ 3.2: Teams & Stores (3-4d)  │  │
     │  │ 3.3: Customers (3-4 dias)   │  │
     │  │ 3.4: Leads (4-5 dias)       │  │
     │  └─────────────────────────────┘  │
     └────────┬────────────────────────────┘
              ↓
       ┌────────────────────┐
       │ Integração & Testes│ (2-3 dias)
       │ • E2E frontend+bck │
       │ • Code review      │
       │ • Deploy/Merge     │
       └────────────────────┘
```

---

## ✅ Checklist Rápido do Dev

### Backend

- [ ] Leu [Implementation Guide](./implementation-guide-sprint-1.md)?
- [ ] Modelagem de User/Team/Store/Customer/Lead pronta?
- [ ] JWT + Hash de senha configurados?
- [ ] Fase 1 (Auth) 100% pronta?
- [ ] Fase 2 (RBAC) 100% pronta?
- [ ] Fase 3 (CRUDs) 100% pronta?
- [ ] Testes unitários rodando?
- [ ] Testes integração rodando?
- [ ] Frontend consegue consumir endpoints?

### Frontend

- [ ] Leu [Contratos](./endpoints-sprint-1.md)?
- [ ] Tela de login testada (POST `/auth/login`)?
- [ ] Telas admin testadas (USER CRUD)?
- [ ] Telas operacionais testadas (LEAD CRUD)?
- [ ] Tratamento de erro consistente?
- [ ] Validações combinadas com backend?

### Arquitetura/QA

- [ ] Requisitos funcionais cobertos?
- [ ] Requisitos não-funcionais validados?
- [ ] RBAC testado em todos os endpoints?
- [ ] Cobertura de testes > 80%?
- [ ] Code review aprovado?

---

## 🔗 Links Rápidos

| Documento | Público | Para quem | Link |
| --- | --- | --- | --- |
| **Contratos Detalhados** | ✅ | Backend, Frontend, QA | [endpoints-sprint-1.md](./endpoints-sprint-1.md) |
| **Rastreabilidade** | ✅ | Arquitetura, Revisão | [traceability-endpoints-to-requirements.md](./traceability-endpoints-to-requirements.md) |
| **Guia de Implementação** | ✅ | Backend | [implementation-guide-sprint-1.md](./implementation-guide-sprint-1.md) |
| **Product Backlog** | ✅ | Todas as equipes | [../../agile/product-backlog.md](../../agile/product-backlog.md) |
| **Sprint 1 Backlog** | ✅ | Todas as equipes | [../../agile/sprint-1-backlog.md](../../agile/sprint-1-backlog.md) |
| **Backend Architecture** | ✅ | Backend, Arquitetura | [../../architecture/backend-module-structure.md](../../architecture/backend-module-structure.md) |

---

## 📞 FAQ Rápido

### **P: Por onde começo?**
**R:** Depende do seu papel:
- Backend → [Implementation Guide](./implementation-guide-sprint-1.md)
- Frontend → [Contratos](./endpoints-sprint-1.md)
- Arquitetura → [Rastreabilidade](./traceability-endpoints-to-requirements.md)

---

### **P: Qual é a ordem correta de implementação dos endpoints?**
**R:** Veja [Fase 1 → Fase 2 → Fase 3](./implementation-guide-sprint-1.md#3-ordem-recomendada-de-implementação) no guia de implementação.

---

### **P: Quais campos são obrigatórios em cada request?**
**R:** Procure pelo endpoint em [endpoints-sprint-1.md](./endpoints-sprint-1.md) e veja a seção "Request".

---

### **P: Quais são os códigos de status esperados?**
**R:** Todos em [endpoints-sprint-1.md](./endpoints-sprint-1.md#tratamento-de-erros-padrão) — resumo:
- `200/201`: Sucesso
- `400`: Validação
- `401`: JWT inválido
- `403`: Sem autorização
- `404`: Não encontrado

---

### **P: Como funciona o RBAC?**
**R:** Veja [Rastreabilidade → US-03](./traceability-endpoints-to-requirements.md#us-03-implementar-rbac-no-backend-para-todos-os-perfis).

---

### **P: Valores esperados de `role`?**
**R:** `ADMIN`, `MANAGER_GERAL`, `MANAGER`, `ATTENDANT` — detalhes em [Enums](./endpoints-sprint-1.md#enums-e-constantes).

---

## 📝 Versionamento

| Versão | Data | Responsável | Mudanças |
| --- | --- | --- | --- |
| 1.0 | 2025-04-06 | Documentação Inicial | Contratos iniciais + guia + rastreabilidade |

---

## 🚁 Drop-in Integration Points

Aos fazer integração com:

### Postman / Insomnia
→ Copie os exemplos de request/response de [endpoints-sprint-1.md](./endpoints-sprint-1.md)

### OpenAPI / Swagger
→ Use decorators NestJS para auto-gerar a partir dos endpoints

### Frontend (React/Next)
→ Crie SDK/hooks baseado em [endpoints-sprint-1.md](./endpoints-sprint-1.md)

### Database
→ Use [Sprint 1 Backlog → Frente 1](../../agile/sprint-1-backlog.md) para migrations

---

## 🎓 Referência: US-01 a US-07 Resumidas

| US | Título | Endpoints | Módulo |
| --- | --- | --- | --- |
| **US-01** | Autenticação JWT | `POST /auth/login` | Auth |
| **US-02** | Atualizar credenciais | `PUT /auth/credentials` | Auth |
| **US-03** | RBAC Backend | (Transversal) | Infra |
| **US-04** | CRUD Usuários | `POST/GET/PUT/DELETE /users` | User |
| **US-05** | CRUD Equipes & Lojas | `POST/GET/PUT /teams`, `/stores` | Team, Store |
| **US-06** | CRUD Clientes | `POST/GET/PUT /customers` | Customer |
| **US-07** | CRUD Leads | `POST/GET/PUT /leads` | Lead |

---

**Última atualização**: 2025-04-06  
**Status**: Ativo — Documento vivo, atualizar conforme sprint avança  
**Mantido por**: Time de Backend, Frontend & Arquitetura
