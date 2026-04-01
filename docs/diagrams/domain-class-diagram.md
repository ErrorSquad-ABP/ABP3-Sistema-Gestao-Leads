```mermaid

---
config:
  layout: elk
---
classDiagram
direction RL

class AggregateRoot {
  -DomainEvent[] _domainEvents
  +getDomainEvents() DomainEvent[]
  +clearEvents() void
}

class DomainEvent {
  +occurredAt: Date
}

class Specification {
  <<interface>>
  +isSatisfiedBy(candidate: T) Promise~boolean~
}

class Name {
  -_value: string
  +value: string
}

class Email {
  -_value: string
  +value: string
}

class Phone {
  -_value: string
  +value: string
}

class PasswordHash {
  -_value: string
  +value: string
}

class LeadSource {
  -_value: string
  +value: string
}

class CloseReason {
  -_value: string
  +value: string
}

class UserRole {
  <<enumeration>>
  ATTENDANT
  MANAGER
  GENERAL_MANAGER
  ADMINISTRATOR
}

class LeadStatus {
  <<enumeration>>
  NEW
  CONTACTED
  QUALIFIED
  DISQUALIFIED
  CONVERTED
}

class DealStatus {
  <<enumeration>>
  OPEN
  WON
  LOST
}

class DealStage {
  <<enumeration>>
  INITIAL_CONTACT
  NEGOTIATION
  PROPOSAL
  CLOSING
}

class DealImportance {
  <<enumeration>>
  COLD
  WARM
  HOT
}

class AuditActionType {
  <<enumeration>>
  LOGIN
  CREATE
  UPDATE
  DELETE
  STATUS_CHANGE
  STAGE_CHANGE
}

class User {
  +id: UUID
  +name: Name
  +email: Email
  +passwordHash: PasswordHash
  +role: UserRole
  +teamId: int?
  +changeName(name: Name) void
  +changeEmail(email: Email) void
  +changePassword(passwordHash: PasswordHash) void
  +assignToTeam(teamId: int) void
  +changeRole(role: UserRole) void
}

class Team {
  +id: int
  +name: Name
  +managerId: UUID?
  +changeName(name: Name) void
  +assignManager(userId: UUID) void
}

class Store {
  +id: int
  +name: Name
  +changeName(name: Name) void
}

class Customer {
  +id: UUID
  +name: Name
  +email: Email?
  +phone: Phone?
  +changeName(name: Name) void
  +changeEmail(email: Email?) void
  +changePhone(phone: Phone?) void
}

class Lead {
  +id: UUID
  +customerId: UUID
  +storeId: int
  +ownerUserId: UUID
  +source: LeadSource
  +status: LeadStatus
  +changeSource(source: LeadSource) void
  +changeStatus(status: LeadStatus) void
  +reassignOwner(userId: UUID) void
  +assignToStore(storeId: int) void
  +convert() void
}

class Deal {
  +id: UUID
  +leadId: UUID
  +status: DealStatus
  +stage: DealStage
  +importance: DealImportance
  +closeReason: CloseReason?
  +setImportance(importance: DealImportance) void
  +markAsOpen() void
  +changeStage(stage: DealStage) void
  +changeStatus(status: DealStatus) void
  +close(reason: CloseReason) void
}

class DealHistory {
  +id: int
  +dealId: UUID
  +changedByUserId: UUID
  +previousStatus: DealStatus?
  +newStatus: DealStatus?
  +previousStage: DealStage?
  +newStage: DealStage?
  +changedAt: Date
}

class AuditLog {
  +id: hash
  +actorUserId: UUID
  +actionType: AuditActionType
  +entityName: string
  +entityId: string
  +createdAt: Date
}

class IUserRepository {
  <<interface>>
  +create(user: User) Promise~User~
  +update(user: User) Promise~User~
  +delete(id: UUID) Promise~void~
  +findById(id: UUID) Promise~User?~
  +findByEmail(email: string) Promise~User?~
  +list() Promise~User[]~
}

class ITeamRepository {
  <<interface>>
  +create(team: Team) Promise~Team~
  +update(team: Team) Promise~Team~
  +delete(id: int) Promise~void~
  +findById(id: int) Promise~Team?~
  +list() Promise~Team[]~
}

class IStoreRepository {
  <<interface>>
  +create(store: Store) Promise~Store~
  +update(store: Store) Promise~Store~
  +delete(id: int) Promise~void~
  +findById(id: int) Promise~Store?~
  +list() Promise~Store[]~
}

class ICustomerRepository {
  <<interface>>
  +create(customer: Customer) Promise~Customer~
  +update(customer: Customer) Promise~Customer~
  +delete(id: UUID) Promise~void~
  +findById(id: UUID) Promise~Customer?~
  +findByEmail(email: string) Promise~Customer?~
  +list() Promise~Customer[]~
}

class ILeadRepository {
  <<interface>>
  +create(lead: Lead) Promise~Lead~
  +update(lead: Lead) Promise~Lead~
  +delete(id: UUID) Promise~void~
  +findById(id: UUID) Promise~Lead?~
  +listByOwner(userId: UUID) Promise~Lead[]~
  +listByTeam(teamId: int) Promise~Lead[]~
}

class IDealRepository {
  <<interface>>
  +create(deal: Deal) Promise~Deal~
  +update(deal: Deal) Promise~Deal~
  +delete(id: UUID) Promise~void~
  +findById(id: UUID) Promise~Deal?~
  +findActiveByLeadId(leadId: UUID) Promise~Deal?~
  +list() Promise~Deal[]~
}

class IAuditLogRepository {
  <<interface>>
  +create(log: AuditLog) Promise~AuditLog~
  +list() Promise~AuditLog[]~
}

IUserRepository ..> User
ITeamRepository ..> Team
IStoreRepository ..> Store
ICustomerRepository ..> Customer
ILeadRepository ..> Lead
IDealRepository ..> Deal
IAuditLogRepository ..> AuditLog

class LeadFactory {
  +create(input: CreateLeadInput) Lead
}

class CustomerFactory {
  +create(input: CreateCustomerInput) Customer
}

class DealFactory {
  +create(input: CreateDealInput) Deal
}

class UserFactory {
  +create(input: CreateUserInput) User
}

class UserEmailUniqueSpec {
  +isSatisfiedBy(email: Email, excludeUserId: UUID?) Promise~boolean~
}

class CustomerEmailUniqueSpec {
  +isSatisfiedBy(email: Email, excludeCustomerId: UUID?) Promise~boolean~
}

class SingleActiveDealPerLeadSpec {
  +isSatisfiedBy(leadId: UUID, excludeDealId: UUID?) Promise~boolean~
}

class LeadRegisteredEvent {
  +leadId: UUID
}

class LeadReassignedEvent {
  +leadId: UUID
  +ownerUserId: UUID
}

class LeadConvertedEvent {
  +leadId: UUID
}

class DealCreatedEvent {
  +dealId: UUID
}

class DealStageChangedEvent {
  +dealId: UUID
  +stage: DealStage
}

class DealStatusChangedEvent {
  +dealId: UUID
  +status: DealStatus
}

class DealClosedEvent {
  +dealId: UUID
  +reason: string
}

class UserAuthenticatedEvent {
  +userId: UUID
}

AggregateRoot <|-- User
AggregateRoot <|-- Team
AggregateRoot <|-- Store
AggregateRoot <|-- Customer
AggregateRoot <|-- Lead
AggregateRoot <|-- Deal
AggregateRoot <|-- AuditLog
AggregateRoot <|-- DealHistory

AggregateRoot o-- "0..*" DomainEvent

DomainEvent <|-- LeadRegisteredEvent
DomainEvent <|-- LeadReassignedEvent
DomainEvent <|-- LeadConvertedEvent
DomainEvent <|-- DealCreatedEvent
DomainEvent <|-- DealStageChangedEvent
DomainEvent <|-- DealStatusChangedEvent
DomainEvent <|-- DealClosedEvent
DomainEvent <|-- UserAuthenticatedEvent

User *-- Name
User *-- Email
User *-- PasswordHash
User --> UserRole
User ..> Team : teamId

Team *-- Name
Team ..> User : managerId

Store *-- Name

Customer *-- Name
Customer o-- Email
Customer o-- Phone

Lead *-- LeadSource
Lead --> LeadStatus
Lead ..> Customer : customerId
Lead ..> Store : storeId
Lead ..> User : ownerUserId

Deal --> DealStatus
Deal --> DealStage
Deal --> DealImportance
Deal o-- CloseReason
Deal ..> Lead : leadId

DealHistory --> DealStatus
DealHistory --> DealStage
DealHistory ..> Deal : dealId
DealHistory ..> User : changedByUserId

AuditLog --> AuditActionType
AuditLog ..> User : actorUserId

LeadFactory ..> Lead
LeadFactory ..> LeadSource
LeadFactory ..> LeadStatus

CustomerFactory ..> Customer
CustomerFactory ..> Name
CustomerFactory ..> Email
CustomerFactory ..> Phone

DealFactory ..> Deal
DealFactory ..> DealStatus
DealFactory ..> DealStage
DealFactory ..> DealImportance
DealFactory ..> CloseReason

UserFactory ..> User
UserFactory ..> Name
UserFactory ..> Email
UserFactory ..> PasswordHash
UserFactory ..> UserRole

Specification <|.. UserEmailUniqueSpec
Specification <|.. CustomerEmailUniqueSpec
Specification <|.. SingleActiveDealPerLeadSpec

UserEmailUniqueSpec ..> IUserRepository
UserEmailUniqueSpec ..> Email

CustomerEmailUniqueSpec ..> ICustomerRepository
CustomerEmailUniqueSpec ..> Email

SingleActiveDealPerLeadSpec ..> IDealRepository

Team "1" o-- "0..*" User : members
Store "1" o-- "0..*" Lead : receives
Customer "1" o-- "0..*" Lead : owns
User "1" o-- "0..*" Lead : handles
Lead "1" o-- "0..1" Deal : active deal
Deal "1" o-- "0..*" DealHistory : history