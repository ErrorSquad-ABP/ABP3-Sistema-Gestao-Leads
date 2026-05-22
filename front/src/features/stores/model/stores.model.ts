import type { LeadStore } from '@/features/leads/model/leads.model';

type StoreRecord = LeadStore;

type StoreMutationInput = {
	name: string;
};

type StoreDialogMode = 'create' | 'edit';

export type { StoreDialogMode, StoreMutationInput, StoreRecord };
