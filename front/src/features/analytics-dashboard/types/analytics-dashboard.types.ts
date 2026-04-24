import type { AuthenticatedUser } from '@/features/login/types/login.types';

type AnalyticsPeriodMode = 'week' | 'month' | 'year' | 'custom';

type AnalyticsDashboardFilter =
	| {
			period: 'week' | 'month' | 'year';
			referenceDate: string;
	  }
	| {
			period: 'custom';
			startDate: string;
			endDate: string;
	  };

type AnalyticsResolvedPeriod = {
	period: AnalyticsPeriodMode;
	startDate: string;
	endDate: string;
	referenceDate: string;
};

type AnalyticsSummary = {
	totalLeads: number;
	convertedLeads: number;
	nonConvertedLeads: number;
	conversionRate: number;
	averageTimeToFirstDealHours: number | null;
};

type AnalyticsComparison = {
	converted: number;
	nonConverted: number;
};

type AnalyticsPerformanceItem = {
	entityId: string | null;
	entityName: string;
	teamId: string | null;
	teamName: string | null;
	totalLeads: number;
	convertedLeads: number;
	nonConvertedLeads: number;
	conversionRate: number;
};

type AnalyticsDistributionItem = {
	key: string;
	label: string;
	totalLeads: number;
	percentage: number;
};

type AnalyticsDashboard = {
	period: AnalyticsResolvedPeriod;
	summary: AnalyticsSummary;
	convertedVsNonConverted: AnalyticsComparison;
	byAttendant: AnalyticsPerformanceItem[];
	byTeam: AnalyticsPerformanceItem[];
	byImportance: AnalyticsDistributionItem[];
	closeReasons: AnalyticsDistributionItem[];
};

type AnalyticDashboardScreenProps = {
	currentUser: AuthenticatedUser;
	initialFilter: AnalyticsDashboardFilter;
};

export type {
	AnalyticDashboardScreenProps,
	AnalyticsComparison,
	AnalyticsDashboard,
	AnalyticsDashboardFilter,
	AnalyticsDistributionItem,
	AnalyticsPerformanceItem,
	AnalyticsPeriodMode,
	AnalyticsResolvedPeriod,
	AnalyticsSummary,
};
