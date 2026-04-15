import type { LeadStore } from '@/features/leads/types/leads.types';

type StoreRecord = LeadStore;

type StoreMutationInput = {
	name: string;
};

type StoreDialogMode = 'create' | 'edit';

export type { StoreDialogMode, StoreMutationInput, StoreRecord };
