import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { VehicleResponseDto } from './vehicle-response.dto.js';

class VehicleCatalogSummaryDto {
	@ApiProperty()
	total!: number;

	@ApiProperty()
	available!: number;

	@ApiProperty()
	reserved!: number;

	@ApiProperty()
	sold!: number;

	@ApiProperty()
	inactive!: number;

	@ApiProperty()
	highInterest!: number;
}

class VehicleCatalogItemDto {
	@ApiProperty({ type: VehicleResponseDto })
	vehicle!: VehicleResponseDto;

	@ApiProperty()
	storeName!: string;

	@ApiProperty()
	dealCount!: number;

	@ApiProperty()
	interests!: {
		leadId: string;
		dealId: string;
		customerName: string;
		dealTitle: string;
		dealStage: string;
		dealStatus: string;
		createdAt: Date;
	}[];

	@ApiProperty()
	daysInStock!: number;

	@ApiPropertyOptional({
		enum: ['ABOVE_AVERAGE', 'BELOW_AVERAGE', 'AT_AVERAGE'],
		nullable: true,
	})
	priceComparison!: string | null;
}

class VehicleCatalogResponseDto {
	@ApiProperty({ type: [VehicleCatalogItemDto] })
	items!: VehicleCatalogItemDto[];

	@ApiProperty({ type: VehicleCatalogSummaryDto })
	summary!: VehicleCatalogSummaryDto;

	@ApiProperty()
	page!: number;

	@ApiProperty()
	limit!: number;

	@ApiProperty()
	total!: number;

	@ApiProperty()
	totalPages!: number;
}

export {
	VehicleCatalogItemDto,
	VehicleCatalogResponseDto,
	VehicleCatalogSummaryDto,
};
