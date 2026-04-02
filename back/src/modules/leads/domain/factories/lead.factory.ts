import { Lead } from '../entities/lead.entity.js';
import { LeadAlreadyConvertedError } from '../errors/lead-already-converted.error.js';
import { LeadConvertedEvent } from '../events/lead-converted.event.js';
import { LeadReassignedEvent } from '../events/lead-reassigned.event.js';
import { LeadRegisteredEvent } from '../events/lead-registered.event.js';
import { parseLeadStatus } from '../../../../shared/domain/enums/lead-status.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { LeadSource } from '../../../../shared/domain/value-objects/lead-source.value-object.js';

type CreateLeadParams = {
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
};

type UpdateLeadParams = {
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
	readonly status: string;
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

	update(lead: Lead, params: UpdateLeadParams): Lead {
		return new Lead(
			lead.id,
			Uuid.parse(params.customerId),
			Uuid.parse(params.storeId),
			params.ownerUserId === null ? null : Uuid.parse(params.ownerUserId),
			LeadSource.create(params.source),
			parseLeadStatus(params.status),
		);
	}

	reassign(lead: Lead, ownerUserId: string | null): Lead {
		const updated = new Lead(
			lead.id,
			lead.customerId,
			lead.storeId,
			ownerUserId === null ? null : Uuid.parse(ownerUserId),
			lead.source,
			lead.status,
		);
		updated.recordDomainEvent(
			new LeadReassignedEvent(
				lead.id.toString(),
				lead.ownerUserId?.toString() ?? null,
				ownerUserId,
			),
		);
		return updated;
	}

	convert(lead: Lead): Lead {
		if (lead.isConverted()) {
			throw new LeadAlreadyConvertedError(lead.id.toString());
		}
		const converted = new Lead(
			lead.id,
			lead.customerId,
			lead.storeId,
			lead.ownerUserId,
			lead.source,
			'CONVERTED',
		);
		converted.recordDomainEvent(new LeadConvertedEvent(lead.id.toString()));
		return converted;
	}
}

export { LeadFactory };
export type { CreateLeadParams, UpdateLeadParams };
