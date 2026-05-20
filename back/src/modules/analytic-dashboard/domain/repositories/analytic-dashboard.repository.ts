type AnalyticsTimeMode = 'week' | 'month' | 'year' | 'custom';

type AnalyticsTimeRange = {
	readonly mode: AnalyticsTimeMode;
	readonly startDate: string;
	readonly endDate: string;
	readonly startAt: Date;
	readonly endExclusive: Date;
};

type AnalyticsRankingOptions = {
	readonly top?: number;
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
	readonly lostLeads: number;
	readonly finalizedLeads: number;
	readonly conversionRate: number;
};

type AnalyticDashboardKpi = {
	readonly value: number;
	readonly previousValue: number;
	readonly delta: number;
	readonly deltaPercentage: number | null;
	readonly deltaPoints?: number;
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
	readonly isApproximate: boolean;
	readonly methodology: string;
};

type AnalyticTrendPoint = {
	readonly date: string;
	readonly totalLeads: number;
	readonly convertedLeads: number;
	readonly lostLeads: number;
	readonly conversionRate: number;
	readonly averageTimeToFirstInteractionHours: number | null;
};

type AnalyticDashboardResult = {
	readonly summary: AnalyticSummary;
	readonly kpis: {
		readonly conversionRate: AnalyticDashboardKpi;
		readonly convertedLeads: AnalyticDashboardKpi;
		readonly lostLeads: AnalyticDashboardKpi;
		readonly averageTimeToFirstInteraction: AnalyticDashboardKpi;
	};
	readonly trend: {
		readonly points: readonly AnalyticTrendPoint[];
	};
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
		options?: AnalyticsRankingOptions,
	): Promise<AnalyticDashboardResult>;
}

export type {
	AnalyticDashboardResult,
	AnalyticDistributionItem,
	AnalyticDashboardKpi,
	AnalyticPerformanceItem,
	AnalyticTrendPoint,
	AnalyticsRankingOptions,
	AnalyticsScope,
	AnalyticsTimeMode,
	AnalyticsTimeRange,
	IAnalyticDashboardRepository,
};
