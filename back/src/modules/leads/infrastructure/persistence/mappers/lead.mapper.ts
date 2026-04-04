import type {
	LeadSource as PrismaLeadSource,
	LeadStatus as PrismaLeadStatus,
} from '../../../../../generated/prisma/enums.js';
import { Lead } from '../../../domain/entities/lead.entity.js';
import { parseLeadStatus } from '../../../../../shared/domain/enums/lead-status.enum.js';
import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { LeadSource } from '../../../../../shared/domain/value-objects/lead-source.value-object.js';
import type { LeadRecord } from '../records/lead.record.js';

const LEAD_SOURCE_TO_PRISMA: Record<string, PrismaLeadSource> = {
	'digital-form': 'WEBSITE',
	facebook: 'FACEBOOK',
	indication: 'INDICATION',
	instagram: 'INSTAGRAM',
	'mercado-livre': 'MERCADO_LIVRE',
	other: 'OTHER',
	'phone-call': 'PHONE',
	'store-visit': 'WALK_IN',
	whatsapp: 'WHATSAPP',
};

const PRISMA_SOURCE_TO_LEAD: Record<PrismaLeadSource, string> = {
	FACEBOOK: 'facebook',
	INDICATION: 'indication',
	INSTAGRAM: 'instagram',
	MERCADO_LIVRE: 'mercado-livre',
	OTHER: 'other',
	PHONE: 'phone-call',
	WALK_IN: 'store-visit',
	WEBSITE: 'digital-form',
	WHATSAPP: 'whatsapp',
};

const LEAD_STATUS_TO_PRISMA: Record<string, PrismaLeadStatus> = {
	CONTACTED: 'CONTACTED',
	CONVERTED: 'CONVERTED',
	DISQUALIFIED: 'LOST',
	NEW: 'NEW',
	QUALIFIED: 'QUALIFIED',
};

const PRISMA_STATUS_TO_LEAD: Record<PrismaLeadStatus, string> = {
	CONTACTED: 'CONTACTED',
	CONVERTED: 'CONVERTED',
	LOST: 'DISQUALIFIED',
	NEGOTIATING: 'QUALIFIED',
	NEW: 'NEW',
	QUALIFIED: 'QUALIFIED',
};

class LeadMapper {
	static toDomain(record: LeadRecord): Lead {
		return new Lead(
			Uuid.parse(record.id),
			Uuid.parse(record.customerId),
			Uuid.parse(record.storeId),
			record.ownerUserId === null ? null : Uuid.parse(record.ownerUserId),
			LeadSource.create(PRISMA_SOURCE_TO_LEAD[record.source] ?? 'other'),
			parseLeadStatus(PRISMA_STATUS_TO_LEAD[record.status] ?? 'NEW'),
		);
	}

	static toRecord(lead: Lead): LeadRecord {
		return {
			id: lead.id.value,
			customerId: lead.customerId.value,
			ownerUserId: lead.ownerUserId === null ? null : lead.ownerUserId.value,
			source: LEAD_SOURCE_TO_PRISMA[lead.source.value] ?? 'OTHER',
			status: LEAD_STATUS_TO_PRISMA[lead.status] ?? 'NEW',
			storeId: lead.storeId.value,
		};
	}
}

export { LeadMapper };
