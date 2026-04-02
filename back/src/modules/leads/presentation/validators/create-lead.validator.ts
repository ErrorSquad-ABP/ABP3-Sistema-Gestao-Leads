import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsIn,
	IsNotEmpty,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator';

import { ALLOWED_LEAD_SOURCES } from '../../../../shared/domain/value-objects/lead-source.value-object.js';

class CreateLeadValidator {
	@ApiProperty({
		format: 'uuid',
		example: '550e8400-e29b-41d4-a716-446655440000',
	})
	@IsUUID()
	customerId!: string;

	@ApiProperty({
		format: 'uuid',
		example: '660e8400-e29b-41d4-a716-446655440001',
	})
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
		example: 'whatsapp',
	})
	@IsString()
	@IsNotEmpty()
	@IsIn(ALLOWED_LEAD_SOURCES)
	source!: string;
}

export { CreateLeadValidator };
