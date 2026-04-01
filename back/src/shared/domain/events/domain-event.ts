import { randomUUID } from 'node:crypto';

/**
 * Base for domain events raised by aggregates (see diagram: abstract DomainEvent).
 */
abstract class DomainEvent {
	readonly eventId: string;
	readonly eventName: string;
	readonly occurredAt: Date;
	readonly aggregateId: string;

	protected constructor(
		aggregateId: string,
		eventName: string,
		occurredAt: Date = new Date(),
		eventId: string = randomUUID(),
	) {
		this.aggregateId = aggregateId;
		this.eventName = eventName;
		this.occurredAt = occurredAt;
		this.eventId = eventId;
	}
}

export { DomainEvent };
