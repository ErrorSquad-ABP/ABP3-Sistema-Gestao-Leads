import { ApiProperty } from '@nestjs/swagger';

import { LeadResponseDto } from './lead-response.dto.js';

class LeadCatalogCustomerDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty({ nullable: true })
	email!: string | null;

	@ApiProperty({ nullable: true })
	phone!: string | null;

	@ApiProperty({ nullable: true })
	cpf!: string | null;
}

class LeadCatalogStoreDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;
}

class LeadCatalogOwnerResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	email!: string;
}

class LeadCatalogItemDto {
	@ApiProperty({ type: LeadResponseDto })
	lead!: LeadResponseDto;

	@ApiProperty({ type: LeadCatalogCustomerDto })
	customer!: LeadCatalogCustomerDto;

	@ApiProperty({ type: LeadCatalogStoreDto })
	store!: LeadCatalogStoreDto;

	@ApiProperty({ type: LeadCatalogOwnerResponseDto, nullable: true })
	owner!: LeadCatalogOwnerResponseDto | null;

	@ApiProperty({ nullable: true })
	lastActivityAt!: string | null;

	@ApiProperty()
	lastActivityLabel!: string;

	@ApiProperty()
	openDealsCount!: number;

	@ApiProperty()
	totalDealsCount!: number;

	@ApiProperty()
	hasInteraction!: boolean;
}

class LeadCatalogSummaryDto {
	@ApiProperty()
	total!: number;

	@ApiProperty()
	withInteraction!: number;

	@ApiProperty()
	converted!: number;

	@ApiProperty()
	staleNoContact!: number;

	@ApiProperty()
	conversionRate!: number;
}

class LeadCatalogBreakdownItemDto {
	@ApiProperty()
	label!: string;

	@ApiProperty()
	count!: number;
}

class LeadCatalogFunnelDto {
	@ApiProperty()
	totalLeads!: number;

	@ApiProperty()
	withInteraction!: number;

	@ApiProperty()
	openDeals!: number;

	@ApiProperty()
	converted!: number;
}

class LeadCatalogResponseDto {
	@ApiProperty({ type: [LeadCatalogItemDto] })
	items!: LeadCatalogItemDto[];

	@ApiProperty({ type: LeadCatalogSummaryDto })
	summary!: LeadCatalogSummaryDto;

	@ApiProperty({ type: LeadCatalogFunnelDto })
	funnel!: LeadCatalogFunnelDto;

	@ApiProperty({ type: [LeadCatalogBreakdownItemDto] })
	origins!: LeadCatalogBreakdownItemDto[];

	@ApiProperty()
	page!: number;

	@ApiProperty()
	limit!: number;

	@ApiProperty()
	total!: number;

	@ApiProperty()
	totalPages!: number;
}

export { LeadCatalogResponseDto };
