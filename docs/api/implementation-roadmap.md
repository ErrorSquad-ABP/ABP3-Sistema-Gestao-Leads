# Roadmap Técnico por Módulo e Pasta

## Objetivo
Este roadmap define a ordem de implementação recomendada para o projeto com base no diagrama de implementação atual. Ele segue a direção arquitetural já estabelecida no projeto, priorizando primeiro as fundações compartilhadas, depois a primeira fatia vertical completa (`Lead`) e, por fim, os módulos restantes por replicação do mesmo padrão.

---

## Estratégia de Implementação Recomendada

O caminho mais seguro é:

1. Implementar a fundação arquitetural compartilhada
2. Implementar tipos de domínio reutilizáveis
3. Implementar as entidades centrais do domínio
4. Definir os contratos de repositório
5. Implementar a primeira fatia vertical completa com `Lead`
6. Adicionar suporte a transação + persistência
7. Adicionar domain events + fluxo de outbox
8. Replicar o padrão para os módulos restantes

Isso evita construir controllers antes de o domínio estar estável e impede que a persistência direcione o modelo de negócio prematuramente.

---

# Fase 1 — Fundação Compartilhada

## Pasta Alvo
- `shared/domain`
- `shared/application`
- `shared/infrastructure`

## Arquivos / Classes
- `AggregateRoot`
- `DomainEvent`
- `Specification`
- `IUnitOfWork`
- `TransactionContext`
- `UnitOfWork`

## Objetivo
Criar a base estrutural utilizada por todos os módulos.

## Checklist
- [ ] Implementar `AggregateRoot`
- [ ] Implementar `DomainEvent`
- [ ] Implementar `Specification`
- [ ] Implementar `IUnitOfWork`
- [ ] Implementar `TransactionContext`
- [ ] Implementar `UnitOfWork`

## Resultado Esperado
O projeto ganha uma base estável para transações, domain events e specifications.

---

# Fase 2 — Tipos de Domínio Reutilizáveis

## Pasta Alvo
- `shared/domain/value-objects`
- `shared/domain/enums`

## Arquivos / Classes
### Value Objects
- `Name`
- `Email`
- `Phone`
- `PasswordHash`
- `LeadSource`
- `CloseReason`

### Enums
- `UserRole`
- `LeadStatus`
- `DealStatus`
- `DealStage`
- `DealImportance`
- `AuditActionType`

## Objetivo
Implementar tipos validados não-primitivos e enumerações compartilhadas antes de construir as entidades.

## Checklist
- [ ] Implementar `Name`
- [ ] Implementar `Email`
- [ ] Implementar `Phone`
- [ ] Implementar `PasswordHash`
- [ ] Implementar `LeadSource`
- [ ] Implementar `CloseReason`
- [ ] Implementar `UserRole`
- [ ] Implementar `LeadStatus`
- [ ] Implementar `DealStatus`
- [ ] Implementar `DealStage`
- [ ] Implementar `DealImportance`
- [ ] Implementar `AuditActionType`

## Resultado Esperado
As entidades podem agora depender de tipos validados em vez de strings brutas.

---

# Fase 3 — Entidades Centrais do Domínio

## Pasta Alvo
- `modules/*/domain/entities`

## Ordem de Implementação
1. `User`
2. `Team`
3. `Store`
4. `Customer`
5. `Lead`
6. `Deal`
7. `DealHistory`
8. `AuditLog`

## Objetivo
Implementar o modelo de negócio na ordem de dependência.

## Checklist
- [ ] Implementar `User`
- [ ] Implementar `Team`
- [ ] Implementar `Store`
- [ ] Implementar `Customer`
- [ ] Implementar `Lead`
- [ ] Implementar `Deal`
- [ ] Implementar `DealHistory`
- [ ] Implementar `AuditLog`

## Resultado Esperado
O domínio está estruturalmente completo e pronto para orquestração de casos de uso.

---

# Fase 4 — Contratos de Repositório

## Pasta Alvo
- `modules/*/domain/repositories`

## Arquivos / Classes
- `IUserRepository`
- `ITeamRepository`
- `IStoreRepository`
- `ICustomerRepository`
- `ILeadRepository`
- `IDealRepository`
- `IAuditLogRepository`

## Objetivo
Definir os contratos de persistência antes da implementação concreta de infraestrutura.

## Checklist
- [ ] Implementar `IUserRepository`
- [ ] Implementar `ITeamRepository`
- [ ] Implementar `IStoreRepository`
- [ ] Implementar `ICustomerRepository`
- [ ] Implementar `ILeadRepository`
- [ ] Implementar `IDealRepository`
- [ ] Implementar `IAuditLogRepository`

## Resultado Esperado
A camada de aplicação pode agora depender de abstrações em vez de persistência concreta.

---

# Fase 5 — Factories e Specifications

## Pasta Alvo
- `modules/*/domain/factories`
- `modules/*/domain/specifications`

## Arquivos / Classes
### Factories
- `LeadFactory`
- `CustomerFactory`
- `DealFactory`
- `UserFactory`

### Specifications
- `UserEmailUniqueSpec`
- `CustomerEmailUniqueSpec`
- `SingleActiveDealPerLeadSpec`

## Objetivo
Centralizar regras de construção e regras de validação de domínio que dependem de repositórios.

## Checklist
- [ ] Implementar `LeadFactory`
- [ ] Implementar `CustomerFactory`
- [ ] Implementar `DealFactory`
- [ ] Implementar `UserFactory`
- [ ] Implementar `UserEmailUniqueSpec`
- [ ] Implementar `CustomerEmailUniqueSpec`
- [ ] Implementar `SingleActiveDealPerLeadSpec`

## Resultado Esperado
A lógica de criação e as regras de negócio entre entidades não estão mais espalhadas pelos casos de uso.

---

# Fase 6 — Primeira Fatia Vertical: Lead

Este deve ser o primeiro módulo completamente funcional.

## Pasta Alvo
- `modules/leads/application`
- `modules/leads/presentation`
- `modules/leads/infrastructure`

---

## Passo 6.1 — DTOs

### Arquivos / Classes
- `CreateLeadDto`
- `UpdateLeadDto`
- `LeadResponseDto`

### Checklist
- [ ] Implementar `CreateLeadDto`
- [ ] Implementar `UpdateLeadDto`
- [ ] Implementar `LeadResponseDto`

---

## Passo 6.2 — Mapper

### Arquivos / Classes
- `LeadMapper`

### Checklist
- [ ] Implementar `LeadMapper`

### Objetivo
Traduzir entre o formato de persistência, o formato de domínio e o formato de resposta.

---

## Passo 6.3 — Casos de Uso do Lead

### Arquivos / Classes
- `CreateLeadUseCase`
- `UpdateLeadUseCase`
- `FindLeadUseCase`
- `ListOwnLeadsUseCase`
- `ListTeamLeadsUseCase`
- `ReassignLeadUseCase`
- `ConvertLeadUseCase`
- `DeleteLeadUseCase`

### Ordem Recomendada
1. `CreateLeadUseCase`
2. `FindLeadUseCase`
3. `UpdateLeadUseCase`
4. `ListOwnLeadsUseCase`
5. `ListTeamLeadsUseCase`
6. `ReassignLeadUseCase`
7. `ConvertLeadUseCase`
8. `DeleteLeadUseCase`

### Checklist
- [ ] Implementar `CreateLeadUseCase`
- [ ] Implementar `FindLeadUseCase`
- [ ] Implementar `UpdateLeadUseCase`
- [ ] Implementar `ListOwnLeadsUseCase`
- [ ] Implementar `ListTeamLeadsUseCase`
- [ ] Implementar `ReassignLeadUseCase`
- [ ] Implementar `ConvertLeadUseCase`
- [ ] Implementar `DeleteLeadUseCase`

---

## Passo 6.4 — Controller

### Arquivos / Classes
- `LeadController`

### Checklist
- [ ] Implementar `LeadController`

## Resultado Esperado
O módulo `Lead` torna-se a primeira funcionalidade utilizável de ponta a ponta.

---

# Fase 7 — Camada de Persistência

## Pasta Alvo
- `modules/*/infrastructure/repositories`
- `modules/*/infrastructure/mappers`
- `prisma`
- `shared/infrastructure`

## Records / Modelos de Persistência
- `UserRecord`
- `TeamRecord`
- `StoreRecord`
- `CustomerRecord`
- `LeadRecord`
- `DealRecord`
- `DealHistoryRecord`
- `AuditLogRecord`
- `OutboxEventRecord`

## Repositórios Concretos
- `LeadPrismaRepository`
- `UserPrismaRepository`
- `TeamPrismaRepository`
- `StorePrismaRepository`
- `CustomerPrismaRepository`
- `DealPrismaRepository`
- `AuditLogPrismaRepository`

## Factories
- `LeadRepositoryFactory`

## Ordem Recomendada
1. `LeadRecord`
2. `LeadPrismaRepository`
3. `LeadRepositoryFactory`
4. Records restantes
5. Repositórios restantes

## Checklist
- [ ] Implementar `LeadRecord`
- [ ] Implementar `LeadPrismaRepository`
- [ ] Implementar `LeadRepositoryFactory`
- [ ] Implementar `UserRecord`
- [ ] Implementar `TeamRecord`
- [ ] Implementar `StoreRecord`
- [ ] Implementar `CustomerRecord`
- [ ] Implementar `DealRecord`
- [ ] Implementar `DealHistoryRecord`
- [ ] Implementar `AuditLogRecord`
- [ ] Implementar `OutboxEventRecord`
- [ ] Implementar `UserPrismaRepository`
- [ ] Implementar `TeamPrismaRepository`
- [ ] Implementar `StorePrismaRepository`
- [ ] Implementar `CustomerPrismaRepository`
- [ ] Implementar `DealPrismaRepository`
- [ ] Implementar `AuditLogPrismaRepository`

## Resultado Esperado
A aplicação ganha suporte concreto de persistência alinhado com o diagrama de implementação.

---

# Fase 8 — Domain Events e Outbox

## Pasta Alvo
- `shared/domain/events`
- `shared/application/events`
- `shared/infrastructure/outbox`

## Arquivos / Classes
### Dispatcher / Contratos
- `IDomainEventDispatcher`
- `DomainEventDispatcher`
- `IDomainEventHandler`

### Outbox
- `OutboxEvent`
- `OutboxEventRecord`
- `OutboxEventProcessor`

### Eventos Concretos
- `LeadRegisteredEvent`
- `LeadReassignedEvent`
- `LeadConvertedEvent`
- `DealCreatedEvent`
- `DealStageChangedEvent`
- `DealStatusChangedEvent`
- `DealClosedEvent`
- `UserAuthenticatedEvent`

## Objetivo
Fechar o fluxo de eventos descrito no diagrama de implementação:
aggregate coleta eventos → caso de uso despacha → dispatcher armazena outbox → processor lê e despacha para handlers.

## Checklist
- [ ] Implementar `IDomainEventDispatcher`
- [ ] Implementar `DomainEventDispatcher`
- [ ] Implementar `IDomainEventHandler`
- [ ] Implementar `OutboxEvent`
- [ ] Implementar `OutboxEventRecord`
- [ ] Implementar `OutboxEventProcessor`
- [ ] Implementar `LeadRegisteredEvent`
- [ ] Implementar `LeadReassignedEvent`
- [ ] Implementar `LeadConvertedEvent`
- [ ] Implementar `DealCreatedEvent`
- [ ] Implementar `DealStageChangedEvent`
- [ ] Implementar `DealStatusChangedEvent`
- [ ] Implementar `DealClosedEvent`
- [ ] Implementar `UserAuthenticatedEvent`

## Resultado Esperado
A arquitetura assíncrona torna-se executável e alinhada com o diagrama.

---

# Fase 9 — Módulos Restantes

Após o `Lead` estar estável, replicar a mesma estratégia de implementação para os outros módulos.

## Ordem Recomendada
1. `Customer`
2. `User`
3. `Team`
4. `Store`
5. `Deal`
6. `AuditLog`

## Checklist
- [ ] Implementar camada de aplicação para `Customer`
- [ ] Implementar camada de infraestrutura para `Customer`
- [ ] Implementar camada de apresentação para `Customer`
- [ ] Implementar camada de aplicação para `User`
- [ ] Implementar camada de infraestrutura para `User`
- [ ] Implementar camada de apresentação para `User`
- [ ] Implementar camada de aplicação para `Team`
- [ ] Implementar camada de infraestrutura para `Team`
- [ ] Implementar camada de apresentação para `Team`
- [ ] Implementar camada de aplicação para `Store`
- [ ] Implementar camada de infraestrutura para `Store`
- [ ] Implementar camada de apresentação para `Store`
- [ ] Implementar camada de aplicação para `Deal`
- [ ] Implementar camada de infraestrutura para `Deal`
- [ ] Implementar camada de apresentação para `Deal`
- [ ] Implementar camada de aplicação para `AuditLog`
- [ ] Implementar camada de infraestrutura para `AuditLog`
- [ ] Implementar camada de apresentação para `AuditLog`

---

# Plano de Execução Mínimo

Se o objetivo é começar a codificar imediatamente com o menor risco, utilize exatamente esta ordem:

1. `AggregateRoot`
2. `DomainEvent`
3. `TransactionContext`
4. `IUnitOfWork`
5. `UnitOfWork`
6. Todos os VOs compartilhados
7. Todos os enums
8. `User`
9. `Team`
10. `Store`
11. `Customer`
12. `Lead`
13. `ILeadRepository`
14. `IUserRepository`
15. `ICustomerRepository`
16. `IStoreRepository`
17. `LeadFactory`
18. `CreateLeadDto`
19. `UpdateLeadDto`
20. `LeadResponseDto`
21. `LeadMapper`
22. `LeadRecord`
23. `LeadPrismaRepository`
24. `CreateLeadUseCase`
25. `FindLeadUseCase`
26. `LeadController`
27. Casos de uso restantes do Lead
28. Dispatcher/outbox
29. `Deal`
30. `DealHistory`
31. `AuditLog`
32. Repositórios e módulos restantes

---

# Sugestão Orientada por Pasta

## Sequência de Implementação Sugerida pela Estrutura do Projeto

### `shared/domain`
- [ ] `AggregateRoot`
- [ ] `DomainEvent`
- [ ] `Specification`
- [ ] value objects compartilhados
- [ ] enums compartilhados

### `shared/application`
- [ ] `IUnitOfWork`
- [ ] `IDomainEventDispatcher`
- [ ] `IDomainEventHandler`

### `shared/infrastructure`
- [ ] `TransactionContext`
- [ ] `UnitOfWork`
- [ ] `DomainEventDispatcher`
- [ ] `OutboxEventProcessor`

### `modules/leads/domain`
- [ ] `Lead`
- [ ] `LeadFactory`

### `modules/leads/application`
- [ ] DTOs
- [ ] casos de uso

### `modules/leads/infrastructure`
- [ ] `LeadMapper`
- [ ] `LeadRecord`
- [ ] `LeadPrismaRepository`
- [ ] `LeadRepositoryFactory`

### `modules/leads/presentation`
- [ ] `LeadController`

### `modules/customers`, `modules/users`, `modules/teams`, `modules/stores`, `modules/deals`, `modules/audit-logs`
- [ ] replicar o mesmo padrão de camadas após a fatia do lead estar estável

---

# Recomendação Final

Não comece pelos controllers.

Não comece apenas pelos modelos do Prisma.

Não comece por todos os módulos de uma vez.

Comece com:
- core compartilhado
- tipos de domínio compartilhados
- domínio do lead
- contrato de repositório do lead
- factory do lead
- DTOs e mapper do lead
- Prisma repository do lead
- casos de uso do lead
- controller do lead
- events/outbox
- módulos restantes

Isso fornece a primeira fatia do sistema completa, testável e arquiteturalmente coerente.
