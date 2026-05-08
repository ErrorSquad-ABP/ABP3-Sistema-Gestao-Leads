type OperationalDashboardStatusKey =
	| 'NEW'
	| 'CONTACTED'
	| 'QUALIFIED'
	| 'DISQUALIFIED'
	| 'CONVERTED';

type OperationalDashboardSourceKey =
	| 'store-visit'
	| 'phone-call'
	| 'whatsapp'
	| 'instagram'
	| 'facebook'
	| 'mercado-livre'
	| 'indication'
	| 'digital-form'
	| 'other';

type OperationalDashboardImportanceKey = 'COLD' | 'WARM' | 'HOT';

type DashboardDistributionItem<TKey extends string> = {
	key: TKey;
	count: number;
	percentage: number;
};

type DashboardStoreDistributionItem = {
	storeId: string;
	storeName: string;
	count: number;
	percentage: number;
};

type OperationalDashboardData = {
	period: {
		startDate: string;
		endDate: string;
		days: number;
	};
	scope: {
		role: 'ADMINISTRATOR' | 'MANAGER' | 'GENERAL_MANAGER';
		storeIds: string[] | null;
	};
	totals: {
		totalLeads: number;
		totalLeadsWithOpenDeal: number;
	};
	distributions: {
		byStatus: DashboardDistributionItem<OperationalDashboardStatusKey>[];
		bySource: DashboardDistributionItem<OperationalDashboardSourceKey>[];
		byStore: DashboardStoreDistributionItem[];
		byImportance: DashboardDistributionItem<OperationalDashboardImportanceKey>[];
	};
};

type OperationalDashboardQueryInput = {
	startDate?: string;
	endDate?: string;
};

export type {
	DashboardDistributionItem,
	DashboardStoreDistributionItem,
	OperationalDashboardData,
	OperationalDashboardImportanceKey,
	OperationalDashboardQueryInput,
	OperationalDashboardSourceKey,
	OperationalDashboardStatusKey,
};
