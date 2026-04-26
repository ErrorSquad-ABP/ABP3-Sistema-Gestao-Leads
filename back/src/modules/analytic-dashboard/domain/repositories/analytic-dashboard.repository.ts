type AnalyticsTimeMode = 'week' | 'month' | 'year' | 'custom';

type AnalyticsTimeRange = {
	readonly mode: AnalyticsTimeMode;
	readonly startDate: string;
	readonly endDate: string;
	readonly startAt: Date;
	readonly endExclusive: Date;
};

type AnalyticsScope =
	| { readonly kind: 'full' }
	| {
			readonly kind: 'attendant';
			readonly actorUserId: string;
			readonly readStoreIds: readonly string[];
	  }
	| {
			readonly kind: 'manager';
			readonly actorUserId: string;
			readonly readTeamIds: readonly string[];
			readonly readStoreIds: readonly string[];
	  }
	| {
			readonly kind: 'general_manager';
			readonly actorUserId: string;
			readonly readStoreIds: readonly string[];
	  };

type AnalyticSummary = {
	readonly totalLeads: number;
	readonly convertedLeads: number;
	readonly notConvertedLeads: number;
	readonly conversionRate: number;
};

type AnalyticPerformanceItem = {
	readonly id: string;
	readonly name: string;
	readonly totalLeads: number;
	readonly convertedLeads: number;
	readonly notConvertedLeads: number;
	readonly conversionRate: number;
	readonly openDeals: number;
	readonly wonDeals: number;
	readonly lostDeals: number;
};

type AnalyticDistributionItem = {
	readonly key: string;
	readonly label: string;
	readonly count: number;
};

type AverageTimeToFirstInteraction = {
	readonly hours: number | null;
	readonly leadsWithInteraction: number;
};

type AnalyticDashboardResult = {
	readonly summary: AnalyticSummary;
	readonly byAttendant: readonly AnalyticPerformanceItem[];
	readonly byTeam: readonly AnalyticPerformanceItem[];
	readonly importanceDistribution: readonly AnalyticDistributionItem[];
	readonly finalizationReasons: readonly AnalyticDistributionItem[];
	readonly averageTimeToFirstInteraction: AverageTimeToFirstInteraction;
};

interface IAnalyticDashboardRepository {
	getAnalyticDashboard(
		scope: AnalyticsScope,
		timeRange: AnalyticsTimeRange,
	): Promise<AnalyticDashboardResult>;
}

export type {
	AnalyticDashboardResult,
	AnalyticDistributionItem,
	AnalyticPerformanceItem,
	AnalyticsScope,
	AnalyticsTimeMode,
	AnalyticsTimeRange,
	IAnalyticDashboardRepository,
};
