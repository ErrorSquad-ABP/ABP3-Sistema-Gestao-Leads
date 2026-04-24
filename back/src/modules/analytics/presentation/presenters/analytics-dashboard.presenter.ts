import type { AnalyticsDashboardDto } from '../../application/dto/analytics-dashboard.dto.js';
import type { AnalyticsDashboardResponseDto } from '../dto/analytics-dashboard.response.dto.js';

class AnalyticsDashboardPresenter {
	static toResponse(
		dashboard: AnalyticsDashboardDto,
	): AnalyticsDashboardResponseDto {
		return {
			period: {
				period: dashboard.period.period,
				startDate: dashboard.period.startDate,
				endDate: dashboard.period.endDate,
				referenceDate: dashboard.period.referenceDate,
			},
			summary: {
				totalLeads: dashboard.summary.totalLeads,
				convertedLeads: dashboard.summary.convertedLeads,
				nonConvertedLeads: dashboard.summary.nonConvertedLeads,
				conversionRate: dashboard.summary.conversionRate,
				averageTimeToFirstDealHours:
					dashboard.summary.averageTimeToFirstDealHours,
			},
			convertedVsNonConverted: {
				converted: dashboard.convertedVsNonConverted.converted,
				nonConverted: dashboard.convertedVsNonConverted.nonConverted,
			},
			byAttendant: [...dashboard.byAttendant],
			byTeam: [...dashboard.byTeam],
			byImportance: [...dashboard.byImportance],
			closeReasons: [...dashboard.closeReasons],
		};
	}
}

export { AnalyticsDashboardPresenter };
