import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from 'class-validator';

import { DEAL_STATUSES } from '../../../../shared/domain/enums/deal-status.enum.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

class ListDealsQueryValidator {
	@ApiPropertyOptional({
		description: 'Filtro por store (aplicável ao escopo do utilizador).',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	storeId?: string;

	@ApiPropertyOptional({
		description: 'Filtro por owner (apenas ADMINISTRATOR).',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	ownerUserId?: string;

	@ApiPropertyOptional({ enum: DEAL_STATUSES })
	@IsOptional()
	@IsString()
	@IsIn(DEAL_STATUSES)
	status?: string;

	@ApiPropertyOptional({
		description: 'Página (base 1).',
		default: DEFAULT_PAGE,
		minimum: 1,
		example: DEFAULT_PAGE,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = DEFAULT_PAGE;

	@ApiPropertyOptional({
		description: 'Itens por página (máximo 50).',
		default: DEFAULT_LIMIT,
		minimum: 1,
		maximum: MAX_LIMIT,
		example: DEFAULT_LIMIT,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_LIMIT)
	limit: number = DEFAULT_LIMIT;
}

export { ListDealsQueryValidator };
