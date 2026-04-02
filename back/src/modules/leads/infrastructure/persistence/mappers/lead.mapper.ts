import type {
	LeadSource as PrismaLeadSource,
	LeadStatus as PrismaLeadStatus,
} from '../../../../../generated/prisma/enums.js';
import { Lead } from '../../../domain/entities/lead.entity.js';
import { parseLeadStatus } from '../../../../../shared/domain/enums/lead-status.enum.js';
import { LeadSource } from '../../../../../shared/domain/value-objects/lead-source.value-object.js';
import type { LeadRecord } from '../records/lead.record.js';

const LEAD_SOURCE_TO_PRISMA: Record<string, PrismaLeadSource> = {
	'digital-form': 'WEBSITE',
	instagram: 'OTHER',
	other: 'OTHER',
	'phone-call': 'PHONE',
	'store-visit': 'WALK_IN',
	whatsapp: 'WHATSAPP',
};

const PRISMA_SOURCE_TO_LEAD: Record<PrismaLeadSource, string> = {
	INDICATION: 'other',
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
			record.id,
			record.customerId,
			record.storeId,
			record.ownerUserId,
			LeadSource.create(PRISMA_SOURCE_TO_LEAD[record.source] ?? 'other'),
			parseLeadStatus(PRISMA_STATUS_TO_LEAD[record.status] ?? 'NEW'),
		);
	}

	static toRecord(lead: Lead): LeadRecord {
		return {
			id: lead.id,
			customerId: lead.customerId,
			ownerUserId: lead.ownerUserId,
			source: LEAD_SOURCE_TO_PRISMA[lead.source.value] ?? 'OTHER',
			status: LEAD_STATUS_TO_PRISMA[lead.status] ?? 'NEW',
			storeId: lead.storeId,
		};
	}
}

export { LeadMapper };
