import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadSource } from '../../../../shared/domain/value-objects/lead-source.value-object.js';
import { Lead } from '../entities/lead.entity.js';
import { LeadRegisteredEvent } from '../events/lead-registered.event.js';

type CreateLeadParams = {
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
};

class LeadFactory {
	create(params: CreateLeadParams): Lead {
		const lead = new Lead(
			Uuid.generate(),
			Uuid.parse(params.customerId),
			Uuid.parse(params.storeId),
			params.ownerUserId === null ? null : Uuid.parse(params.ownerUserId),
			LeadSource.create(params.source),
			'NEW',
		);
		lead.recordDomainEvent(
			new LeadRegisteredEvent(
				lead.id.toString(),
				lead.ownerUserId?.toString() ?? null,
			),
		);
		return lead;
	}
}

export { LeadFactory };
export type { CreateLeadParams };
