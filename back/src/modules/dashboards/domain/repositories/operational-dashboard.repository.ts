type DashboardPeriod = {
	readonly startDate: Date;
	readonly endDate: Date;
};

type OperationalDashboardScope = {
	readonly storeIds?: readonly string[];
	readonly ownerUserId?: string;
};

type DashboardDistributionItem = {
	readonly key: string;
	readonly count: number;
};

type DashboardStoreDistributionItem = {
	readonly storeId: string;
	readonly storeName: string;
	readonly count: number;
};

type OperationalDashboardTrendPoint = {
	readonly date: string;
	readonly totalLeads: number;
	readonly activeLeads: number;
	readonly convertedLeads: number;
};

type OperationalDashboardAggregate = {
	readonly totalLeads: number;
	readonly totalLeadsWithOpenDeal: number;
	readonly byStatus: readonly DashboardDistributionItem[];
	readonly bySource: readonly DashboardDistributionItem[];
	readonly byStore: readonly DashboardStoreDistributionItem[];
	readonly byImportance: readonly DashboardDistributionItem[];
};

interface IOperationalDashboardRepository {
	getOperationalAggregate(input: {
		readonly period: DashboardPeriod;
		readonly scope: OperationalDashboardScope;
	}): Promise<OperationalDashboardAggregate>;

	getOperationalTrend(input: {
		readonly period: DashboardPeriod;
		readonly scope: OperationalDashboardScope;
	}): Promise<OperationalDashboardTrendPoint[]>;
}

export type {
	DashboardDistributionItem,
	DashboardPeriod,
	DashboardStoreDistributionItem,
	IOperationalDashboardRepository,
	OperationalDashboardAggregate,
	OperationalDashboardScope,
	OperationalDashboardTrendPoint,
};
