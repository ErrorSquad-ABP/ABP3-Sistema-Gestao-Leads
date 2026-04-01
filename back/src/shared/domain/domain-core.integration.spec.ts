import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AggregateRoot } from './core/index.js';
import { DomainEvent } from './events/index.js';
import {
	AbstractSpecification,
	type Specification,
} from './specifications/index.js';

class SampleEvent extends DomainEvent {
	constructor(aggregateId: string, eventName = 'Sample', occurredAt?: Date) {
		super(aggregateId, eventName, occurredAt);
	}
}

class SampleAggregate extends AggregateRoot {
	emit(aggregateId: string, name?: string): void {
		this.addDomainEvent(new SampleEvent(aggregateId, name ?? 'Sample'));
	}
}

describe('shared domain core (aggregate, events, specification)', () => {
	it('collects domain events, reports hasDomainEvents, and clears them', () => {
		const aggregate = new SampleAggregate();
		assert.equal(aggregate.hasDomainEvents(), false);

		aggregate.emit('agg-1');
		assert.equal(aggregate.hasDomainEvents(), true);

		aggregate.emit('agg-1');
		const events = aggregate.getDomainEvents();
		assert.equal(events.length, 2);
		assert.equal(events[0]?.aggregateId, 'agg-1');
		assert.ok(events[0]?.eventId.length > 0);
		assert.equal(events[0]?.eventName, 'Sample');

		aggregate.clearEvents();
		assert.equal(aggregate.getDomainEvents().length, 0);
		assert.equal(aggregate.hasDomainEvents(), false);
	});

	it('exposes DomainEvent fields per diagram', () => {
		const fixed = new Date('2020-01-01T00:00:00.000Z');
		const event = new SampleEvent('lead-1', 'LeadRegistered', fixed);
		assert.equal(event.aggregateId, 'lead-1');
		assert.equal(event.eventName, 'LeadRegistered');
		assert.equal(event.occurredAt.getTime(), fixed.getTime());
		assert.ok(typeof event.eventId === 'string');
	});

	it('does not allow mutating occurredAt via Date aliasing', () => {
		const fixed = new Date('2020-01-01T00:00:00.000Z');
		const event = new SampleEvent('a', 'E', fixed);
		const first = event.occurredAt;
		first.setUTCFullYear(2030);
		assert.equal(event.occurredAt.getTime(), fixed.getTime());
		assert.notEqual(first.getTime(), event.occurredAt.getTime());
	});

	it('composes async specifications with and, or, not', async () => {
		const isPositive: Specification<number> =
			new (class extends AbstractSpecification<number> {
				async isSatisfiedBy(candidate: number): Promise<boolean> {
					return candidate > 0;
				}
			})();

		const isEven: Specification<number> =
			new (class extends AbstractSpecification<number> {
				async isSatisfiedBy(candidate: number): Promise<boolean> {
					return candidate % 2 === 0;
				}
			})();

		const positiveAndEven = isPositive.and(isEven);
		assert.equal(await positiveAndEven.isSatisfiedBy(4), true);
		assert.equal(await positiveAndEven.isSatisfiedBy(3), false);

		const positiveOrEven = isPositive.or(isEven);
		assert.equal(await positiveOrEven.isSatisfiedBy(-2), true);

		assert.equal(await isPositive.not().isSatisfiedBy(-1), true);
		assert.equal(await isPositive.not().isSatisfiedBy(1), false);
	});

	it('allows repository-style async specifications on the same contract', async () => {
		const seen: number[] = [];
		const tracked: Specification<number> =
			new (class extends AbstractSpecification<number> {
				async isSatisfiedBy(candidate: number): Promise<boolean> {
					seen.push(candidate);
					await Promise.resolve();
					return candidate === 42;
				}
			})();

		assert.equal(await tracked.isSatisfiedBy(42), true);
		assert.deepEqual(seen, [42]);
	});
});
