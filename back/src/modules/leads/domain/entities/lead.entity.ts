import { AggregateRoot } from '../../../../shared/domain/core/aggregate-root.js';
import type { LeadStatus } from '../../../../shared/domain/enums/lead-status.enum.js';
import type { DomainEvent } from '../../../../shared/domain/events/domain-event.js';
import type {
	StoreId,
	UUID,
} from '../../../../shared/domain/types/identifiers.js';
import type { LeadSource } from '../../../../shared/domain/value-objects/lead-source.value-object.js';

/**
 * Lead aggregate root (operational context: leads).
 */
class Lead extends AggregateRoot {
	readonly id: UUID;
	readonly customerId: UUID;
	readonly storeId: StoreId;
	readonly ownerUserId: UUID | null;
	readonly source: LeadSource;
	readonly status: LeadStatus;

	constructor(
		id: UUID,
		customerId: UUID,
		storeId: StoreId,
		ownerUserId: UUID | null,
		source: LeadSource,
		status: LeadStatus,
	) {
		super();
		this.id = id;
		this.customerId = customerId;
		this.storeId = storeId;
		this.ownerUserId = ownerUserId;
		this.source = source;
		this.status = status;
	}

	recordDomainEvent(event: DomainEvent): void {
		this.addDomainEvent(event);
	}

	isConverted(): boolean {
		return this.status === 'CONVERTED';
	}
}

export { Lead };
