import { DomainEvent } from '../../../../shared/domain/events/domain-event.js';

class LeadReassignedEvent extends DomainEvent {
	readonly previousOwnerUserId: string | null;
	readonly newOwnerUserId: string | null;

	constructor(
		leadId: string,
		previousOwnerUserId: string | null,
		newOwnerUserId: string | null,
	) {
		super(leadId, 'lead.reassigned');
		this.previousOwnerUserId = previousOwnerUserId;
		this.newOwnerUserId = newOwnerUserId;
	}
}

export { LeadReassignedEvent };
