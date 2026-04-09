import type {
	LeadSource as PrismaLeadSource,
	LeadStatus as PrismaLeadStatus,
} from '../../../../../generated/prisma/enums.js';

type LeadRecord = {
	readonly id: string;
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: PrismaLeadSource;
	readonly status: PrismaLeadStatus;
};

export type { LeadRecord };
