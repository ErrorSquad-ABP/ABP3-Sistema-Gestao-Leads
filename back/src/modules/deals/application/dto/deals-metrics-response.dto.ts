import { ApiProperty } from '@nestjs/swagger';

class DealsMetricsResponseDto {
	@ApiProperty({ minimum: 0 })
	openDealsCount!: number;

	@ApiProperty({ minimum: 0 })
	wonDealsCount!: number;

	@ApiProperty({ minimum: 0 })
	lostDealsCount!: number;

	@ApiProperty({ minimum: 0 })
	totalPipelineValue!: number;

	@ApiProperty({ minimum: 0 })
	averageTicket!: number;

	@ApiProperty({ minimum: 0, maximum: 1 })
	conversionRate!: number;
}

export { DealsMetricsResponseDto };
