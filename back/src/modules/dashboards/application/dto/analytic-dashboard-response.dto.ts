import { ApiProperty } from '@nestjs/swagger';

class AnalyticDashboardFilterDto {
	@ApiProperty({ enum: ['week', 'month', 'year', 'custom'] })
	mode!: 'week' | 'month' | 'year' | 'custom';

	@ApiProperty({ example: '2026-04-01' })
	startDate!: string;

	@ApiProperty({ example: '2026-04-30' })
	endDate!: string;

	@ApiProperty({
		enum: ['attendant', 'manager', 'general_manager', 'full'],
	})
	scope!: 'attendant' | 'manager' | 'general_manager' | 'full';
}

class AnalyticDashboardSummaryDto {
	@ApiProperty()
	totalLeads!: number;

	@ApiProperty()
	convertedLeads!: number;

	@ApiProperty()
	notConvertedLeads!: number;

	@ApiProperty({ example: 37.5 })
	conversionRate!: number;
}

class AnalyticDashboardPerformanceItemDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	totalLeads!: number;

	@ApiProperty()
	convertedLeads!: number;

	@ApiProperty()
	notConvertedLeads!: number;

	@ApiProperty({ example: 42.86 })
	conversionRate!: number;

	@ApiProperty()
	openDeals!: number;

	@ApiProperty()
	wonDeals!: number;

	@ApiProperty()
	lostDeals!: number;
}

class AnalyticDashboardDistributionItemDto {
	@ApiProperty()
	key!: string;

	@ApiProperty()
	label!: string;

	@ApiProperty()
	count!: number;
}

class AverageTimeToFirstInteractionDto {
	@ApiProperty({ nullable: true, example: 18.75 })
	hours!: number | null;

	@ApiProperty()
	leadsWithInteraction!: number;
}

class AnalyticDashboardResponseDto {
	@ApiProperty({ type: () => AnalyticDashboardFilterDto })
	filter!: AnalyticDashboardFilterDto;

	@ApiProperty({ type: () => AnalyticDashboardSummaryDto })
	summary!: AnalyticDashboardSummaryDto;

	@ApiProperty({ type: () => [AnalyticDashboardPerformanceItemDto] })
	byAttendant!: AnalyticDashboardPerformanceItemDto[];

	@ApiProperty({ type: () => [AnalyticDashboardPerformanceItemDto] })
	byTeam!: AnalyticDashboardPerformanceItemDto[];

	@ApiProperty({ type: () => [AnalyticDashboardDistributionItemDto] })
	importanceDistribution!: AnalyticDashboardDistributionItemDto[];

	@ApiProperty({ type: () => [AnalyticDashboardDistributionItemDto] })
	finalizationReasons!: AnalyticDashboardDistributionItemDto[];

	@ApiProperty({ type: () => AverageTimeToFirstInteractionDto })
	averageTimeToFirstInteraction!: AverageTimeToFirstInteractionDto;
}

export {
	AnalyticDashboardDistributionItemDto,
	AnalyticDashboardFilterDto,
	AnalyticDashboardPerformanceItemDto,
	AnalyticDashboardResponseDto,
	AnalyticDashboardSummaryDto,
	AverageTimeToFirstInteractionDto,
};
