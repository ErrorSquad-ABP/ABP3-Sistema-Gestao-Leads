import { DomainEvent } from '../../../../shared/domain/events/domain-event.js';

class LeadRegisteredEvent extends DomainEvent {
	readonly ownerUserId: string | null;

	constructor(leadId: string, ownerUserId: string | null) {
		super(leadId, 'lead.registered');
		this.ownerUserId = ownerUserId;
	}
}

export { LeadRegisteredEvent };
