import type { LeadCustomer } from '@/features/leads/model/leads.model';

type CustomerRecord = LeadCustomer;

type CustomerMutationInput = {
	name: string;
	email?: string | null;
	phone?: string | null;
	cpf?: string | null;
};

type CustomerDialogMode = 'create' | 'edit';

export type { CustomerDialogMode, CustomerMutationInput, CustomerRecord };
