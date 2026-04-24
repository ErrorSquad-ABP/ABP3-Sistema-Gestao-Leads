import { ApiProperty } from '@nestjs/swagger';

import { TEMPORAL_FILTER_MODES } from '../../../../shared/domain/enums/temporal-filter-mode.enum.js';

class AnalyticsResolvedPeriodResponseDto {
	@ApiProperty({
		enum: TEMPORAL_FILTER_MODES,
		example: 'month',
	})
	period!: string;

	@ApiProperty({ format: 'date', example: '2026-04-01' })
	startDate!: string;

	@ApiProperty({ format: 'date', example: '2026-04-30' })
	endDate!: string;

	@ApiProperty({ format: 'date', example: '2026-04-22' })
	referenceDate!: string;
}

class AnalyticsSummaryResponseDto {
	@ApiProperty({ example: 120 })
	totalLeads!: number;

	@ApiProperty({ example: 34 })
	convertedLeads!: number;

	@ApiProperty({ example: 86 })
	nonConvertedLeads!: number;

	@ApiProperty({ example: 28.33 })
	conversionRate!: number;

	@ApiProperty({
		example: 18.5,
		nullable: true,
		description: 'Tempo medio entre a criacao do lead e a primeira negociacao.',
	})
	averageTimeToFirstDealHours!: number | null;
}

class AnalyticsComparisonResponseDto {
	@ApiProperty({ example: 34 })
	converted!: number;

	@ApiProperty({ example: 86 })
	nonConverted!: number;
}

class AnalyticsPerformanceItemResponseDto {
	@ApiProperty({
		format: 'uuid',
		nullable: true,
		example: '11111111-1111-1111-1111-111111111111',
	})
	entityId!: string | null;

	@ApiProperty({ example: 'Maria Silva' })
	entityName!: string;

	@ApiProperty({
		format: 'uuid',
		nullable: true,
		example: '22222222-2222-2222-2222-222222222222',
	})
	teamId!: string | null;

	@ApiProperty({ nullable: true, example: 'Equipe Centro' })
	teamName!: string | null;

	@ApiProperty({ example: 20 })
	totalLeads!: number;

	@ApiProperty({ example: 6 })
	convertedLeads!: number;

	@ApiProperty({ example: 14 })
	nonConvertedLeads!: number;

	@ApiProperty({ example: 30 })
	conversionRate!: number;
}

class AnalyticsDistributionItemResponseDto {
	@ApiProperty({ example: 'HOT' })
	key!: string;

	@ApiProperty({ example: 'Hot' })
	label!: string;

	@ApiProperty({ example: 12 })
	totalLeads!: number;

	@ApiProperty({ example: 25 })
	percentage!: number;
}

class AnalyticsDashboardResponseDto {
	@ApiProperty({ type: AnalyticsResolvedPeriodResponseDto })
	period!: AnalyticsResolvedPeriodResponseDto;

	@ApiProperty({ type: AnalyticsSummaryResponseDto })
	summary!: AnalyticsSummaryResponseDto;

	@ApiProperty({ type: AnalyticsComparisonResponseDto })
	convertedVsNonConverted!: AnalyticsComparisonResponseDto;

	@ApiProperty({ type: [AnalyticsPerformanceItemResponseDto] })
	byAttendant!: AnalyticsPerformanceItemResponseDto[];

	@ApiProperty({ type: [AnalyticsPerformanceItemResponseDto] })
	byTeam!: AnalyticsPerformanceItemResponseDto[];

	@ApiProperty({ type: [AnalyticsDistributionItemResponseDto] })
	byImportance!: AnalyticsDistributionItemResponseDto[];

	@ApiProperty({ type: [AnalyticsDistributionItemResponseDto] })
	closeReasons!: AnalyticsDistributionItemResponseDto[];
}

export {
	AnalyticsComparisonResponseDto,
	AnalyticsDashboardResponseDto,
	AnalyticsDistributionItemResponseDto,
	AnalyticsPerformanceItemResponseDto,
	AnalyticsResolvedPeriodResponseDto,
	AnalyticsSummaryResponseDto,
};
