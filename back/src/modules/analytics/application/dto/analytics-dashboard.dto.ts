import type {
	ResolvedTemporalFilterDto,
	TemporalFilterDto,
} from '../../../../shared/application/dto/temporal-filter.dto.js';
import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';

type AnalyticsScopeDto =
	| {
			readonly kind: 'own';
			readonly userId: string;
	  }
	| {
			readonly kind: 'team';
			readonly teamId: string;
	  }
	| {
			readonly kind: 'global';
	  };

type GetAnalyticsDashboardInputDto = {
	readonly filter: TemporalFilterDto;
	readonly role: UserRole;
	readonly userId: string;
};

type AnalyticsSummaryDto = {
	readonly totalLeads: number;
	readonly convertedLeads: number;
	readonly nonConvertedLeads: number;
	readonly conversionRate: number;
	readonly averageTimeToFirstDealHours: number | null;
};

type AnalyticsComparisonDto = {
	readonly converted: number;
	readonly nonConverted: number;
};

type AnalyticsPerformanceItemDto = {
	readonly entityId: string | null;
	readonly entityName: string;
	readonly teamId: string | null;
	readonly teamName: string | null;
	readonly totalLeads: number;
	readonly convertedLeads: number;
	readonly nonConvertedLeads: number;
	readonly conversionRate: number;
};

type AnalyticsDistributionItemDto = {
	readonly key: string;
	readonly label: string;
	readonly totalLeads: number;
	readonly percentage: number;
};

type AnalyticsDashboardDto = {
	readonly period: ResolvedTemporalFilterDto;
	readonly summary: AnalyticsSummaryDto;
	readonly convertedVsNonConverted: AnalyticsComparisonDto;
	readonly byAttendant: readonly AnalyticsPerformanceItemDto[];
	readonly byTeam: readonly AnalyticsPerformanceItemDto[];
	readonly byImportance: readonly AnalyticsDistributionItemDto[];
	readonly closeReasons: readonly AnalyticsDistributionItemDto[];
};

type AnalyticsLeadRecord = {
	readonly leadId: string;
	readonly leadStatus: string;
	readonly leadCreatedAt: Date;
	readonly ownerUserId: string | null;
	readonly ownerName: string | null;
	readonly teamId: string | null;
	readonly teamName: string | null;
	readonly firstDealCreatedAt: Date | null;
};

export type {
	AnalyticsComparisonDto,
	AnalyticsDashboardDto,
	AnalyticsDistributionItemDto,
	AnalyticsLeadRecord,
	AnalyticsPerformanceItemDto,
	AnalyticsScopeDto,
	AnalyticsSummaryDto,
	GetAnalyticsDashboardInputDto,
};
