import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator';

import { LEAD_STATUSES } from '../../../../shared/domain/enums/lead-status.enum.js';
import { ALLOWED_LEAD_SOURCES } from '../../../../shared/domain/value-objects/lead-source.value-object.js';

class UpdateLeadValidator {
	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	customerId!: string;

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	storeId!: string;

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description: 'Responsável pelo lead; omita ou use null para lead sem dono.',
	})
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	ownerUserId!: string | null;

	@ApiProperty({
		enum: ALLOWED_LEAD_SOURCES,
		example: 'store-visit',
	})
	@IsString()
	@IsNotEmpty()
	@IsIn(ALLOWED_LEAD_SOURCES)
	source!: string;

	@ApiProperty({
		enum: LEAD_STATUSES,
		example: 'QUALIFIED',
	})
	@IsString()
	@IsNotEmpty()
	@IsIn(LEAD_STATUSES)
	status!: string;

	@ApiPropertyOptional({
		nullable: true,
		description:
			'Interesse inicial em veículo (texto livre, sem vínculo estrutural).',
	})
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	@IsNotEmpty()
	vehicleInterestText?: string | null;
}

export { UpdateLeadValidator };
