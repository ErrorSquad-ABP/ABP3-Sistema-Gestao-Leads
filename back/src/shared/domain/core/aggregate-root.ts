import type { DomainEvent } from '../events/domain-event.js';

/**
 * Base for aggregate roots that collect domain events for dispatch after persistence.
 */
abstract class AggregateRoot {
	private readonly _domainEvents: DomainEvent[] = [];

	protected addDomainEvent(event: DomainEvent): void {
		this._domainEvents.push(event);
	}

	getDomainEvents(): DomainEvent[] {
		return [...this._domainEvents];
	}

	clearEvents(): void {
		this._domainEvents.length = 0;
	}

	hasDomainEvents(): boolean {
		return this._domainEvents.length > 0;
	}
}

export { AggregateRoot };
