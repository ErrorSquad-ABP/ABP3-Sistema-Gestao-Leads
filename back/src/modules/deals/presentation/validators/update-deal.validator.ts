import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator';

import { DEAL_IMPORTANCES } from '../../../../shared/domain/enums/deal-importance.enum.js';
import { DEAL_STAGES } from '../../../../shared/domain/enums/deal-stage.enum.js';
import { DEAL_STATUSES } from '../../../../shared/domain/enums/deal-status.enum.js';

class UpdateDealValidator {
	@ApiPropertyOptional({
		format: 'uuid',
		description: 'Troca de veículo (apenas se deal estiver OPEN)',
	})
	@IsOptional()
	@IsUUID()
	vehicleId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	title?: string;

	@ApiPropertyOptional({ nullable: true })
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

	@ApiPropertyOptional({ enum: DEAL_STATUSES })
	@IsOptional()
	@IsString()
	@IsIn(DEAL_STATUSES)
	status?: string;
}

export { UpdateDealValidator };
