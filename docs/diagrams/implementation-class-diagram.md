```mermaid

---
config:
  layout: elk
---
classDiagram
direction TB
    class AggregateRoot {
        -DomainEvent[] _domainEvents
        #addDomainEvent(event: DomainEvent) void
        +getDomainEvents() DomainEvent[]
        +clearEvents() void
        +hasDomainEvents() boolean
    }

    class DomainEvent {
        <<abstract>>
        +eventId: string
        +eventName: string
        +occurredAt: Date
        +aggregateId: string
    }

    class Specification~T~ {
        
        +isSatisfiedBy(candidate: T) Promise~boolean~
        +and(other: Specification~T~) Specification~T~
        +or(other: Specification~T~) Specification~T~
        +not() Specification~T~
    }

    class IUnitOfWork {
	    +begin() Promise~void~
	    +commit() Promise~void~
	    +rollback() Promise~void~
	    +getTransactionContext() TransactionContext
    }

    class TransactionContext {
	    +client: object
    }

    class UnitOfWork {
	    -transactionContext: TransactionContext
	    +begin() Promise~void~
	    +commit() Promise~void~
	    +rollback() Promise~void~
	    +getTransactionContext() TransactionContext
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
	    ATTENDANT
	    MANAGER
	    GENERAL_MANAGER
	    ADMINISTRATOR
    }

    class LeadStatus {
	    NEW
	    CONTACTED
	    QUALIFIED
	    DISQUALIFIED
	    CONVERTED
    }

    class DealStatus {
	    OPEN
	    WON
	    LOST
    }

    class DealStage {
	    INITIAL_CONTACT
	    NEGOTIATION
	    PROPOSAL
	    CLOSING
    }

    class DealImportance {
	    COLD
	    WARM
	    HOT
    }

    class AuditActionType {
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
	    +create(user: User) Promise~User~
	    +update(user: User) Promise~User~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~User?~
	    +findByEmail(email: string) Promise~User?~
	    +list() Promise~User[]~
    }

    class ITeamRepository {
	    +create(team: Team) Promise~Team~
	    +update(team: Team) Promise~Team~
	    +delete(id: int) Promise~void~
	    +findById(id: int) Promise~Team?~
	    +list() Promise~Team[]~
    }

    class IStoreRepository {
	    +create(store: Store) Promise~Store~
	    +update(store: Store) Promise~Store~
	    +delete(id: int) Promise~void~
	    +findById(id: int) Promise~Store?~
	    +list() Promise~Store[]~
    }

    class ICustomerRepository {
	    +create(customer: Customer) Promise~Customer~
	    +update(customer: Customer) Promise~Customer~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Customer?~
	    +findByEmail(email: string) Promise~Customer?~
	    +list() Promise~Customer[]~
    }

    class ILeadRepository {
	    +create(lead: Lead) Promise~Lead~
	    +update(lead: Lead) Promise~Lead~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Lead?~
	    +listByOwner(userId: UUID) Promise~Lead[]~
	    +listByTeam(teamId: int) Promise~Lead[]~
    }

    class IDealRepository {
	    +create(deal: Deal) Promise~Deal~
	    +update(deal: Deal) Promise~Deal~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Deal?~
	    +findActiveByLeadId(leadId: UUID) Promise~Deal?~
	    +list() Promise~Deal[]~
    }

    class IAuditLogRepository {
	    +create(log: AuditLog) Promise~AuditLog~
	    +list() Promise~AuditLog[]~
    }

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

    class LeadController {
	    +create(input: CreateLeadDto) Promise~LeadResponseDto~
	    +update(id: UUID, input: UpdateLeadDto) Promise~LeadResponseDto~
	    +findById(id: UUID) Promise~LeadResponseDto~
	    +listOwn(ownerUserId: UUID) Promise~LeadResponseDto[]~
	    +listTeam(teamId: int) Promise~LeadResponseDto[]~
	    +reassign(id: UUID, ownerUserId: UUID) Promise~LeadResponseDto~
	    +convert(id: UUID) Promise~LeadResponseDto~
	    +delete(id: UUID) Promise~void~
    }

    class CreateLeadUseCase {
	    +execute(input: CreateLeadDto) Promise~Lead~
    }

    class UpdateLeadUseCase {
	    +execute(id: UUID, input: UpdateLeadDto) Promise~Lead~
    }

    class FindLeadUseCase {
	    +execute(id: UUID) Promise~Lead?~
    }

    class ListOwnLeadsUseCase {
	    +execute(ownerUserId: UUID) Promise~Lead[]~
    }

    class ListTeamLeadsUseCase {
	    +execute(teamId: int) Promise~Lead[]~
    }

    class ReassignLeadUseCase {
	    +execute(id: UUID, ownerUserId: UUID) Promise~Lead~
    }

    class ConvertLeadUseCase {
	    +execute(id: UUID) Promise~Lead~
    }

    class DeleteLeadUseCase {
	    +execute(id: UUID) Promise~void~
    }

    class LeadMapper {
	    +toDomain(row: LeadRow) Lead
	    +toPersistence(lead: Lead) LeadPersistence
	    +toResponse(lead: Lead) LeadResponseDto
    }

    class CreateLeadDto {
	    +customerId: UUID
	    +storeId: int
	    +ownerUserId: UUID
	    +source: string
    }

    class UpdateLeadDto {
	    +storeId: int?
	    +ownerUserId: UUID?
	    +source: string?
	    +status: LeadStatus?
    }

    class LeadResponseDto {
	    +id: UUID
	    +customerId: UUID
	    +storeId: int
	    +ownerUserId: UUID
	    +source: string
	    +status: LeadStatus
    }

    class LeadPrismaRepository {
	    -mapper: LeadMapper
	    -transactionContext: TransactionContext
	    +create(lead: Lead) Promise~Lead~
	    +update(lead: Lead) Promise~Lead~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Lead?~
	    +listByOwner(userId: UUID) Promise~Lead[]~
	    +listByTeam(teamId: int) Promise~Lead[]~
    }

    class LeadRepositoryFactory {
	    +create(context: TransactionContext) ILeadRepository
    }

    class UserPrismaRepository {
	    +create(user: User) Promise~User~
	    +update(user: User) Promise~User~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~User?~
	    +findByEmail(email: string) Promise~User?~
	    +list() Promise~User[]~
    }

    class TeamPrismaRepository {
	    +create(team: Team) Promise~Team~
	    +update(team: Team) Promise~Team~
	    +delete(id: int) Promise~void~
	    +findById(id: int) Promise~Team?~
	    +list() Promise~Team[]~
    }

    class StorePrismaRepository {
	    +create(store: Store) Promise~Store~
	    +update(store: Store) Promise~Store~
	    +delete(id: int) Promise~void~
	    +findById(id: int) Promise~Store?~
	    +list() Promise~Store[]~
    }

    class CustomerPrismaRepository {
	    +create(customer: Customer) Promise~Customer~
	    +update(customer: Customer) Promise~Customer~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Customer?~
	    +findByEmail(email: string) Promise~Customer?~
	    +list() Promise~Customer[]~
    }

    class DealPrismaRepository {
	    +create(deal: Deal) Promise~Deal~
	    +update(deal: Deal) Promise~Deal~
	    +delete(id: UUID) Promise~void~
	    +findById(id: UUID) Promise~Deal?~
	    +findActiveByLeadId(leadId: UUID) Promise~Deal?~
	    +list() Promise~Deal[]~
    }

    class AuditLogPrismaRepository {
	    +create(log: AuditLog) Promise~AuditLog~
	    +list() Promise~AuditLog[]~
    }

    class UserRecord {
	    +id: UUID
	    +name: string
	    +email: string
	    +passwordHash: string
	    +role: string
	    +teamId: int?
    }

    class TeamRecord {
	    +id: int
	    +name: string
	    +managerId: UUID?
    }

    class StoreRecord {
	    +id: int
	    +name: string
    }

    class CustomerRecord {
	    +id: UUID
	    +name: string
	    +email: string?
	    +phone: string?
    }

    class LeadRecord {
	    +id: UUID
	    +customerId: UUID
	    +storeId: int
	    +ownerUserId: UUID
	    +source: string
	    +status: string
    }

    class DealRecord {
	    +id: UUID
	    +leadId: UUID
	    +status: string
	    +stage: string
	    +importance: string
	    +closeReason: string?
    }

    class DealHistoryRecord {
	    +id: int
	    +dealId: UUID
	    +changedByUserId: UUID
	    +previousStatus: string?
	    +newStatus: string?
	    +previousStage: string?
	    +newStage: string?
	    +changedAt: Date
    }

    class AuditLogRecord {
	    +id: hash
	    +actorUserId: UUID
	    +actionType: string
	    +entityName: string
	    +entityId: string
	    +createdAt: Date
    }

    class OutboxEventRecord {
    +id: UUID
    +eventName: string
    +payload: string
    +occurredAt: Date
    +processedAt: Date?
}

    class IDomainEventDispatcher {
	    +dispatch(events: DomainEvent[]) Promise~void~
    }

    class DomainEventDispatcher {
	    +dispatch(events: DomainEvent[]) Promise~void~
    }

    class OutboxEvent {
	    +id: UUID
	    +eventName: string
	    +payload: string
	    +occurredAt: Date
	    +processedAt: Date?
    }

    class OutboxEventProcessor {
	    +processPending() Promise~void~
    }

    class IDomainEventHandler {
	    +handle(event: DomainEvent) Promise~void~
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

	<<interface>> Specification
	<<interface>> IUnitOfWork
	<<enumeration>> UserRole
	<<enumeration>> LeadStatus
	<<enumeration>> DealStatus
	<<enumeration>> DealStage
	<<enumeration>> DealImportance
	<<enumeration>> AuditActionType
	<<interface>> IUserRepository
	<<interface>> ITeamRepository
	<<interface>> IStoreRepository
	<<interface>> ICustomerRepository
	<<interface>> ILeadRepository
	<<interface>> IDealRepository
	<<interface>> IAuditLogRepository
	<<PrismaModel>> UserRecord
	<<PrismaModel>> TeamRecord
	<<PrismaModel>> StoreRecord
	<<PrismaModel>> CustomerRecord
	<<PrismaModel>> LeadRecord
	<<PrismaModel>> DealRecord
	<<PrismaModel>> DealHistoryRecord
	<<PrismaModel>> AuditLogRecord
    <<PrismaModel>> OutboxEventRecord
	<<interface>> IDomainEventDispatcher
	<<interface>> IDomainEventHandler

    IUnitOfWork <|.. UnitOfWork
    UnitOfWork *-- TransactionContext
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
    Specification <|.. UserEmailUniqueSpec
    Specification <|.. CustomerEmailUniqueSpec
    Specification <|.. SingleActiveDealPerLeadSpec
    UserEmailUniqueSpec ..> IUserRepository
    UserEmailUniqueSpec ..> Email
    CustomerEmailUniqueSpec ..> ICustomerRepository
    CustomerEmailUniqueSpec ..> Email
    SingleActiveDealPerLeadSpec ..> IDealRepository
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
    Team "1" o-- "0..*" User : members
    Store "1" o-- "0..*" Lead : receives
    Customer "1" o-- "0..*" Lead : owns
    User "1" o-- "0..*" Lead : handles
    Lead "1" o-- "0..1" Deal : active deal
    Deal "1" o-- "0..*" DealHistory : history
    LeadController ..> CreateLeadUseCase
    LeadController ..> UpdateLeadUseCase
    LeadController ..> FindLeadUseCase
    LeadController ..> ListOwnLeadsUseCase
    LeadController ..> ListTeamLeadsUseCase
    LeadController ..> ReassignLeadUseCase
    LeadController ..> ConvertLeadUseCase
    LeadController ..> DeleteLeadUseCase
    CreateLeadUseCase ..> ILeadRepository
    CreateLeadUseCase ..> ICustomerRepository
    CreateLeadUseCase ..> IStoreRepository
    CreateLeadUseCase ..> IUserRepository
    CreateLeadUseCase ..> LeadFactory
    CreateLeadUseCase ..> LeadMapper
    CreateLeadUseCase ..> IUnitOfWork
    CreateLeadUseCase ..> IDomainEventDispatcher
    UpdateLeadUseCase ..> ILeadRepository
    UpdateLeadUseCase ..> LeadMapper
    UpdateLeadUseCase ..> IUnitOfWork
    UpdateLeadUseCase ..> IDomainEventDispatcher
    FindLeadUseCase ..> ILeadRepository
    FindLeadUseCase ..> LeadMapper
    ListOwnLeadsUseCase ..> ILeadRepository
    ListOwnLeadsUseCase ..> LeadMapper
    ListTeamLeadsUseCase ..> ILeadRepository
    ListTeamLeadsUseCase ..> LeadMapper
    ReassignLeadUseCase ..> ILeadRepository
    ReassignLeadUseCase ..> IUserRepository
    ReassignLeadUseCase ..> IUnitOfWork
    ReassignLeadUseCase ..> IDomainEventDispatcher
    ConvertLeadUseCase ..> ILeadRepository
    ConvertLeadUseCase ..> ICustomerRepository
    ConvertLeadUseCase ..> IUnitOfWork
    ConvertLeadUseCase ..> IDomainEventDispatcher
    DeleteLeadUseCase ..> ILeadRepository
    DeleteLeadUseCase ..> IUnitOfWork
    LeadMapper ..> Lead
    LeadMapper ..> LeadSource
    LeadMapper ..> LeadStatus
    LeadMapper ..> CreateLeadDto
    LeadMapper ..> UpdateLeadDto
    LeadMapper ..> LeadResponseDto
    ILeadRepository <|.. LeadPrismaRepository
    LeadPrismaRepository ..> LeadMapper
    LeadPrismaRepository ..> TransactionContext
    LeadRepositoryFactory ..> ILeadRepository
    LeadRepositoryFactory ..> LeadPrismaRepository
    IUserRepository <|.. UserPrismaRepository
    ITeamRepository <|.. TeamPrismaRepository
    IStoreRepository <|.. StorePrismaRepository
    ICustomerRepository <|.. CustomerPrismaRepository
    IDealRepository <|.. DealPrismaRepository
    IAuditLogRepository <|.. AuditLogPrismaRepository
    IUserRepository ..> User
    ITeamRepository ..> Team
    IStoreRepository ..> Store
    ICustomerRepository ..> Customer
    ILeadRepository ..> Lead
    IDealRepository ..> Deal
    IAuditLogRepository ..> AuditLog
    UserPrismaRepository ..> TransactionContext
    TeamPrismaRepository ..> TransactionContext
    StorePrismaRepository ..> TransactionContext
    CustomerPrismaRepository ..> TransactionContext
    DealPrismaRepository ..> TransactionContext
    AuditLogPrismaRepository ..> TransactionContext
    LeadPrismaRepository ..> LeadRecord
    UserPrismaRepository ..> UserRecord
    TeamPrismaRepository ..> TeamRecord
    StorePrismaRepository ..> StoreRecord
    CustomerPrismaRepository ..> CustomerRecord
    DealPrismaRepository ..> DealRecord
    AuditLogPrismaRepository ..> AuditLogRecord
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
    DomainEventDispatcher ..> OutboxEventRecord
    OutboxEventProcessor ..> OutboxEventRecord
    OutboxEvent ..> OutboxEventRecord
    IDomainEventDispatcher <|.. DomainEventDispatcher
    DomainEventDispatcher ..> OutboxEvent
    DomainEventDispatcher ..> DomainEvent
    OutboxEventProcessor ..> OutboxEvent
    OutboxEventProcessor ..> IDomainEventHandler
    IDomainEventHandler ..> DomainEvent
