import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateIf,
} from 'class-validator';

import { DEAL_IMPORTANCES } from '../../../../shared/domain/enums/deal-importance.enum.js';
import { DEAL_STAGES } from '../../../../shared/domain/enums/deal-stage.enum.js';

class CreateDealValidator {
	@ApiProperty({ example: 'Proposta veículo X' })
	@IsString()
	@IsNotEmpty()
	title!: string;

	@ApiPropertyOptional({
		nullable: true,
		description: 'Valor como string decimal (ex.: "45000.00").',
	})
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	@IsNotEmpty()
	value?: string | null;

	@ApiPropertyOptional({ enum: DEAL_IMPORTANCES })
	@IsOptional()
	@IsString()
	@IsIn(DEAL_IMPORTANCES)
	importance?: string;

	@ApiPropertyOptional({ enum: DEAL_STAGES })
	@IsOptional()
	@IsString()
	@IsIn(DEAL_STAGES)
	stage?: string;
}

export { CreateDealValidator };
