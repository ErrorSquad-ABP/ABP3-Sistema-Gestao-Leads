import type { CustomerSummary } from '../../customers/types/customers.types';
import type { StoreSummary } from '../../stores/types/stores.types';
import type { UserSummary } from '../../users/types/users.types';

type LeadSource =
	| 'instagram'
	| 'indication'
	| 'other'
	| 'phone'
	| 'walk_in'
	| 'website'
	| 'whatsapp';

type LeadStatus =
	| 'CONTACTED'
	| 'CONVERTED'
	| 'LOST'
	| 'NEGOTIATING'
	| 'NEW'
	| 'QUALIFIED';

type Lead = {
	readonly id: string;
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: LeadSource;
	readonly status: LeadStatus;
	readonly customer: CustomerSummary;
	readonly store: StoreSummary;
	readonly owner: UserSummary | null;
};

type CreateLeadInput = {
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId?: string | null;
	readonly source: LeadSource;
};

type UpdateLeadInput = {
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId?: string | null;
	readonly source: LeadSource;
	readonly status: LeadStatus;
};

type ReassignLeadInput = {
	readonly ownerUserId: string | null;
};

export type {
	CreateLeadInput,
	Lead,
	LeadSource,
	LeadStatus,
	ReassignLeadInput,
	UpdateLeadInput,
};
