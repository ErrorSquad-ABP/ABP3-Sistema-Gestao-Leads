import type { AnalyticDashboardResponseDto } from '../../application/dto/analytic-dashboard-response.dto.js';

class AnalyticDashboardPresenter {
	static toResponse(
		payload: AnalyticDashboardResponseDto,
	): AnalyticDashboardResponseDto {
		return payload;
	}
}

export { AnalyticDashboardPresenter };
