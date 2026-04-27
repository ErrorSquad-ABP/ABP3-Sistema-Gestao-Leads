import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LeadDetailLeadDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	source!: string;

	@ApiProperty()
	status!: string;

	@ApiPropertyOptional({ nullable: true })
	vehicleInterestText!: string | null;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;

	@ApiProperty({ type: String, format: 'date-time' })
	updatedAt!: Date;
}

class LeadDetailCustomerDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiPropertyOptional({ nullable: true })
	email!: string | null;

	@ApiPropertyOptional({ nullable: true })
	phone!: string | null;
}

class LeadDetailStoreDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;
}

class LeadDetailUserDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	email!: string;
}

class LeadDetailDealDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ format: 'uuid' })
	leadId!: string;

	@ApiProperty()
	title!: string;

	@ApiPropertyOptional({ nullable: true })
	value!: string | null;

	@ApiProperty()
	importance!: string;

	@ApiProperty()
	stage!: string;

	@ApiProperty()
	status!: string;

	@ApiProperty()
	vehicleLabel!: string;

	@ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
	closedAt!: Date | null;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;

	@ApiProperty({ type: String, format: 'date-time' })
	updatedAt!: Date;
}

class LeadTimelineEventActorDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	email!: string;
}

class LeadTimelineEventDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	type!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	description!: string;

	@ApiPropertyOptional({ type: LeadTimelineEventActorDto, nullable: true })
	actor!: LeadTimelineEventActorDto | null;

	@ApiPropertyOptional({
		description:
			'Dados auxiliares seguros para exibição. Payload interno e identificadores operacionais não são retornados.',
		nullable: true,
	})
	metadata!: Record<string, unknown> | null;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;
}

class LeadDetailPermissionsDto {
	@ApiProperty()
	canEdit!: boolean;

	@ApiProperty()
	canReassign!: boolean;

	@ApiProperty()
	canConvert!: boolean;

	@ApiProperty()
	canManageDeals!: boolean;
}

class LeadDetailResponseDto {
	@ApiProperty({ type: LeadDetailLeadDto })
	lead!: LeadDetailLeadDto;

	@ApiProperty({ type: LeadDetailCustomerDto })
	customer!: LeadDetailCustomerDto;

	@ApiProperty({ type: LeadDetailStoreDto })
	store!: LeadDetailStoreDto;

	@ApiPropertyOptional({ type: LeadDetailUserDto, nullable: true })
	owner!: LeadDetailUserDto | null;

	@ApiProperty({ type: [LeadDetailDealDto] })
	deals!: LeadDetailDealDto[];

	@ApiProperty({ type: [LeadTimelineEventDto] })
	timeline!: LeadTimelineEventDto[];

	@ApiProperty({ type: LeadDetailPermissionsDto })
	permissions!: LeadDetailPermissionsDto;
}

export {
	LeadDetailCustomerDto,
	LeadDetailDealDto,
	LeadDetailLeadDto,
	LeadDetailPermissionsDto,
	LeadDetailResponseDto,
	LeadDetailStoreDto,
	LeadDetailUserDto,
	LeadTimelineEventDto,
};
