import { DomainEvent } from '../../../../shared/domain/events/domain-event.js';

class LeadConvertedEvent extends DomainEvent {
	constructor(leadId: string) {
		super(leadId, 'lead.converted');
	}
}

export { LeadConvertedEvent };
