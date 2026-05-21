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

type OperationalDashboardKpi = {
	value: number;
	previousValue: number;
	delta: number;
	deltaPercentage: number | null;
	deltaPoints: number | null;
};

type OperationalDashboardTrendPoint = {
	date: string;
	totalLeads: number;
	activeLeads: number;
	convertedLeads: number;
	conversionRate: number;
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
	kpis: {
		totalLeads: OperationalDashboardKpi;
		activeLeads: OperationalDashboardKpi;
		convertedLeads: OperationalDashboardKpi;
		conversionRate: OperationalDashboardKpi;
	};
	distributions: {
		byStatus: DashboardDistributionItem<OperationalDashboardStatusKey>[];
		bySource: DashboardDistributionItem<OperationalDashboardSourceKey>[];
		byStore: DashboardStoreDistributionItem[];
		byImportance: DashboardDistributionItem<OperationalDashboardImportanceKey>[];
	};
	trend: {
		points: OperationalDashboardTrendPoint[];
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
	OperationalDashboardKpi,
	OperationalDashboardQueryInput,
	OperationalDashboardSourceKey,
	OperationalDashboardStatusKey,
	OperationalDashboardTrendPoint,
};
