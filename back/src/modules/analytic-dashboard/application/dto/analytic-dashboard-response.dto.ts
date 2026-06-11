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

	@ApiProperty({ nullable: true, example: 6 })
	top!: number | null;
}

class AnalyticDashboardSummaryDto {
	@ApiProperty()
	totalLeads!: number;

	@ApiProperty()
	convertedLeads!: number;

	@ApiProperty()
	notConvertedLeads!: number;

	@ApiProperty()
	lostLeads!: number;

	@ApiProperty()
	finalizedLeads!: number;

	@ApiProperty({ example: 37.5 })
	conversionRate!: number;
}

class AnalyticDashboardKpiDto {
	@ApiProperty()
	value!: number;

	@ApiProperty()
	previousValue!: number;

	@ApiProperty()
	delta!: number;

	@ApiProperty({ nullable: true })
	deltaPercentage!: number | null;

	@ApiProperty({ required: false })
	deltaPoints?: number;
}

class AnalyticDashboardKpisDto {
	@ApiProperty({ type: () => AnalyticDashboardKpiDto })
	conversionRate!: AnalyticDashboardKpiDto;

	@ApiProperty({ type: () => AnalyticDashboardKpiDto })
	convertedLeads!: AnalyticDashboardKpiDto;

	@ApiProperty({ type: () => AnalyticDashboardKpiDto })
	lostLeads!: AnalyticDashboardKpiDto;

	@ApiProperty({ type: () => AnalyticDashboardKpiDto })
	averageTimeToFirstInteraction!: AnalyticDashboardKpiDto;
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

	@ApiProperty({
		example: true,
		description:
			'Indica que a metrica pode representar uma aproximacao operacional, e nao necessariamente a primeira interacao comercial efetiva.',
	})
	isApproximate!: boolean;

	@ApiProperty({
		example:
			'Aproximacao baseada no primeiro evento operacional registrado, na primeira negociacao criada ou, sem esses registros, em updatedAt do lead.',
	})
	methodology!: string;
}

class AnalyticDashboardTrendPointDto {
	@ApiProperty({ example: '2026-04-01' })
	date!: string;

	@ApiProperty()
	totalLeads!: number;

	@ApiProperty()
	convertedLeads!: number;

	@ApiProperty()
	lostLeads!: number;

	@ApiProperty({ example: 37.5 })
	conversionRate!: number;

	@ApiProperty({ nullable: true, example: 18.75 })
	averageTimeToFirstInteractionHours!: number | null;
}

class AnalyticDashboardTrendDto {
	@ApiProperty({ type: () => [AnalyticDashboardTrendPointDto] })
	points!: AnalyticDashboardTrendPointDto[];
}

class AnalyticDashboardDrillDownLeadDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	label!: string;

	@ApiProperty({ required: false })
	importance?: string;

	@ApiProperty({ required: false, enum: ['converted', 'lost', 'open'] })
	outcome?: 'converted' | 'lost' | 'open';
}

class AnalyticDashboardDrillDownDto {
	@ApiProperty({ type: () => [AnalyticDashboardDrillDownLeadDto] })
	importanceLeads!: AnalyticDashboardDrillDownLeadDto[];

	@ApiProperty({ type: () => [AnalyticDashboardDrillDownLeadDto] })
	conversionLeads!: AnalyticDashboardDrillDownLeadDto[];
}

class AnalyticDashboardResponseDto {
	@ApiProperty({ type: () => AnalyticDashboardFilterDto })
	filter!: AnalyticDashboardFilterDto;

	@ApiProperty({ type: () => AnalyticDashboardSummaryDto })
	summary!: AnalyticDashboardSummaryDto;

	@ApiProperty({ type: () => AnalyticDashboardKpisDto })
	kpis!: AnalyticDashboardKpisDto;

	@ApiProperty({ type: () => AnalyticDashboardTrendDto })
	trend!: AnalyticDashboardTrendDto;

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

	@ApiProperty({ type: () => AnalyticDashboardDrillDownDto })
	drillDown!: AnalyticDashboardDrillDownDto;
}

export {
	AnalyticDashboardDistributionItemDto,
	AnalyticDashboardDrillDownDto,
	AnalyticDashboardDrillDownLeadDto,
	AnalyticDashboardFilterDto,
	AnalyticDashboardKpiDto,
	AnalyticDashboardKpisDto,
	AnalyticDashboardPerformanceItemDto,
	AnalyticDashboardResponseDto,
	AnalyticDashboardSummaryDto,
	AnalyticDashboardTrendDto,
	AnalyticDashboardTrendPointDto,
	AverageTimeToFirstInteractionDto,
};
