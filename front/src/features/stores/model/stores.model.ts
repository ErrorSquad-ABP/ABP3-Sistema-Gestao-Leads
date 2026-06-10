import type { LeadStore } from '@/features/leads/model/leads.model';

type StoreRecord = LeadStore;

type StoreMetricsRecord = {
	storeId: string;
	total: number;
	converted: number;
	openDeals: number;
	conversionRate: number;
	wonValue: number;
};

type StoreMutationInput = {
	addressLine?: string | null;
	city?: string | null;
	coverage?: string | null;
	distributionRegion?: string | null;
	name: string;
	region?: string | null;
	scope?: string | null;
	state?: string | null;
};

type StoreDialogMode = 'create' | 'edit';

export type {
	StoreDialogMode,
	StoreMetricsRecord,
	StoreMutationInput,
	StoreRecord,
};
