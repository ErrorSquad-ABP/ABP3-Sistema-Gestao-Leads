import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LEAD_STATUSES } from '../../../../shared/domain/enums/lead-status.enum.js';
import { ALLOWED_LEAD_SOURCES } from '../../../../shared/domain/value-objects/lead-source.value-object.js';

class LeadCustomerResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Maria Silva' })
	name!: string;

	@ApiPropertyOptional({ format: 'email', nullable: true })
	email!: string | null;

	@ApiPropertyOptional({ nullable: true, example: '11999999999' })
	phone!: string | null;

	@ApiPropertyOptional({ nullable: true, example: '12345678901' })
	cpf!: string | null;
}

class LeadStoreResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Loja Centro' })
	name!: string;
}

class LeadOwnerTeamResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Equipe Sul' })
	name!: string;
}

class LeadOwnerResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Ana Souza' })
	name!: string;

	@ApiProperty({ format: 'email', example: 'ana@example.com' })
	email!: string;

	@ApiProperty({ example: 'ATTENDANT' })
	role!: string;

	@ApiPropertyOptional({ format: 'uuid', nullable: true })
	teamId!: string | null;

	@ApiPropertyOptional({
		type: () => LeadOwnerTeamResponseDto,
		nullable: true,
	})
	team!: LeadOwnerTeamResponseDto | null;
}

class LeadResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ format: 'uuid' })
	customerId!: string;

	@ApiProperty({ format: 'uuid' })
	storeId!: string;

	@ApiPropertyOptional({ format: 'uuid', nullable: true })
	ownerUserId!: string | null;

	@ApiProperty({
		enum: ALLOWED_LEAD_SOURCES,
		example: 'whatsapp',
	})
	source!: string;

	@ApiProperty({
		enum: LEAD_STATUSES,
		example: 'NEW',
	})
	status!: string;

	@ApiProperty({ type: () => LeadCustomerResponseDto })
	customer!: LeadCustomerResponseDto;

	@ApiProperty({ type: () => LeadStoreResponseDto })
	store!: LeadStoreResponseDto;

	@ApiPropertyOptional({
		type: () => LeadOwnerResponseDto,
		nullable: true,
	})
	owner!: LeadOwnerResponseDto | null;
}

export { LeadResponseDto };
