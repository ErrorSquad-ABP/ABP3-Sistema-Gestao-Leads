import { randomUUID } from 'node:crypto';

/**
 * Base for domain events raised by aggregates (see diagram: abstract DomainEvent).
 * `occurredAt` is stored as an epoch ms snapshot so the instant cannot be mutated via `Date` aliasing.
 */
abstract class DomainEvent {
	readonly eventId: string;
	readonly eventName: string;
	readonly aggregateId: string;

	readonly #occurredAtMs: number;

	protected constructor(
		aggregateId: string,
		eventName: string,
		occurredAt: Date = new Date(),
		eventId: string = randomUUID(),
	) {
		this.aggregateId = aggregateId;
		this.eventName = eventName;
		this.eventId = eventId;

		const ms = occurredAt.getTime();
		if (Number.isNaN(ms)) {
			throw new RangeError('DomainEvent occurredAt must be a valid Date');
		}
		this.#occurredAtMs = ms;
	}

	get occurredAt(): Date {
		return new Date(this.#occurredAtMs);
	}
}

export { DomainEvent };
