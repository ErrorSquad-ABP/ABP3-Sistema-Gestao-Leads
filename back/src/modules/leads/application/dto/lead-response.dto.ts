import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LEAD_STATUSES } from '../../../../shared/domain/enums/lead-status.enum.js';
import { ALLOWED_LEAD_SOURCES } from '../../../../shared/domain/value-objects/lead-source.value-object.js';

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

	@ApiPropertyOptional({
		nullable: true,
		description: 'Interesse inicial em veículo (texto livre).',
	})
	vehicleInterestText!: string | null;
}

export { LeadResponseDto };
