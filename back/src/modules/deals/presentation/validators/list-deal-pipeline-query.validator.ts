import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
} from 'class-validator';

import { DEAL_STATUSES } from '../../../../shared/domain/enums/deal-status.enum.js';

const DEFAULT_PIPELINE_PAGE_SIZE = 5;
const MAX_PIPELINE_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 120;

class ListDealPipelineQueryValidator {
	@ApiPropertyOptional({ enum: DEAL_STATUSES })
	@IsOptional()
	@IsString()
	@IsIn(DEAL_STATUSES)
	status?: string;

	@ApiPropertyOptional({
		description: 'Termo de busca por título, cliente ou veículo.',
		maxLength: MAX_SEARCH_LENGTH,
	})
	@IsOptional()
	@IsString()
	@MaxLength(MAX_SEARCH_LENGTH)
	search?: string;

	@ApiPropertyOptional({
		description: 'Itens por etapa no snapshot inicial.',
		default: DEFAULT_PIPELINE_PAGE_SIZE,
		minimum: 1,
		maximum: MAX_PIPELINE_PAGE_SIZE,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_PIPELINE_PAGE_SIZE)
	pageSize: number = DEFAULT_PIPELINE_PAGE_SIZE;
}

export {
	DEFAULT_PIPELINE_PAGE_SIZE,
	ListDealPipelineQueryValidator,
	MAX_PIPELINE_PAGE_SIZE,
};
