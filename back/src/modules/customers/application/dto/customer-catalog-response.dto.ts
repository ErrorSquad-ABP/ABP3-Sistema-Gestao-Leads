import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CustomerResponseDto } from './customer-response.dto.js';

class CustomerCatalogSummaryDto {
	@ApiProperty()
	total!: number;

	@ApiProperty()
	withDeals!: number;

	@ApiProperty()
	active!: number;

	@ApiProperty()
	retentionRate!: number;
}

class CustomerCatalogBreakdownItemDto {
	@ApiProperty()
	label!: string;

	@ApiProperty()
	count!: number;
}

class CustomerCatalogItemDto {
	@ApiProperty({ type: CustomerResponseDto })
	customer!: CustomerResponseDto;

	@ApiPropertyOptional({ nullable: true })
	primaryStoreName!: string | null;

	@ApiProperty()
	leadCount!: number;

	@ApiProperty()
	openDealsCount!: number;

	@ApiProperty()
	wonDealsCount!: number;

	@ApiProperty()
	totalDealsCount!: number;

	@ApiProperty()
	totalDealValue!: string;

	@ApiPropertyOptional({ nullable: true })
	lastActivityAt!: string | null;

	@ApiProperty()
	lastActivityLabel!: string;

	@ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
	status!: 'ACTIVE' | 'INACTIVE';

	@ApiPropertyOptional({ nullable: true })
	source!: string | null;
}

class CustomerCatalogResponseDto {
	@ApiProperty({ type: [CustomerCatalogItemDto] })
	items!: CustomerCatalogItemDto[];

	@ApiProperty({ type: CustomerCatalogSummaryDto })
	summary!: CustomerCatalogSummaryDto;

	@ApiProperty({ type: [CustomerCatalogBreakdownItemDto] })
	origins!: CustomerCatalogBreakdownItemDto[];

	@ApiProperty({ type: [CustomerCatalogBreakdownItemDto] })
	locations!: CustomerCatalogBreakdownItemDto[];

	@ApiProperty({ type: [CustomerCatalogItemDto] })
	highlights!: CustomerCatalogItemDto[];

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
	CustomerCatalogBreakdownItemDto,
	CustomerCatalogItemDto,
	CustomerCatalogResponseDto,
	CustomerCatalogSummaryDto,
};
