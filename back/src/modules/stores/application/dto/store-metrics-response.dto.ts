import { ApiProperty } from '@nestjs/swagger';

class StoreMetricsResponseDto {
	@ApiProperty({ format: 'uuid' })
	storeId!: string;

	@ApiProperty({ example: 42, minimum: 0 })
	total!: number;

	@ApiProperty({ example: 12, minimum: 0 })
	converted!: number;

	@ApiProperty({ example: 8, minimum: 0 })
	openDeals!: number;

	@ApiProperty({ example: 29, minimum: 0, maximum: 100 })
	conversionRate!: number;

	@ApiProperty({ example: 250000, minimum: 0 })
	wonValue!: number;
}

export { StoreMetricsResponseDto };
