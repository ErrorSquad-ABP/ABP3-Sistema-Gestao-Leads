import type { z } from 'zod';

import type { leadListItemSchema } from '../schemas/lead-list.schema';
import type { leadDetailHubSchema } from '../schemas/lead-detail.schema';
import type {
	leadCustomerSchema,
	leadOwnerRecordSchema,
	leadStoreSchema,
	leadTeamSchema,
} from '../schemas/lead-support.schema';
import type {
	leadFormSchema,
	leadSourceValues,
	leadStatusValues,
	reassignLeadSchema,
} from '../schemas/lead-management.schema';

type LeadListItem = z.infer<typeof leadListItemSchema>;
type LeadDetailHub = z.infer<typeof leadDetailHubSchema>;
type LeadCustomer = z.infer<typeof leadCustomerSchema>;
type LeadStore = z.infer<typeof leadStoreSchema>;
type LeadTeam = z.infer<typeof leadTeamSchema>;
type LeadOwnerRecord = z.infer<typeof leadOwnerRecordSchema>;
type LeadFormValues = z.infer<typeof leadFormSchema>;
type ReassignLeadFormValues = z.infer<typeof reassignLeadSchema>;
type LeadSource = (typeof leadSourceValues)[number];
type LeadStatus = (typeof leadStatusValues)[number];

type CreateLeadInput = {
	customerId: string;
	storeId: string;
	ownerUserId: string | null;
	source: LeadSource;
};

type UpdateLeadInput = CreateLeadInput & {
	status: LeadStatus;
};

type ReassignLeadInput = {
	ownerUserId: string | null;
};

export type {
	CreateLeadInput,
	LeadCustomer,
	LeadDetailHub,
	LeadFormValues,
	LeadListItem,
	LeadOwnerRecord,
	LeadSource,
	LeadStatus,
	LeadStore,
	LeadTeam,
	ReassignLeadFormValues,
	ReassignLeadInput,
	UpdateLeadInput,
};
