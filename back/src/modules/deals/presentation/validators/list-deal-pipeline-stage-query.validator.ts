import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import {
	DEFAULT_PIPELINE_PAGE_SIZE,
	ListDealPipelineQueryValidator,
	MAX_PIPELINE_PAGE_SIZE,
} from './list-deal-pipeline-query.validator.js';

class ListDealPipelineStageQueryValidator extends ListDealPipelineQueryValidator {
	@ApiPropertyOptional({
		description: 'Página da etapa (base 1).',
		default: 1,
		minimum: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1;

	@ApiPropertyOptional({
		description: 'Itens por página da etapa.',
		default: DEFAULT_PIPELINE_PAGE_SIZE,
		minimum: 1,
		maximum: MAX_PIPELINE_PAGE_SIZE,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_PIPELINE_PAGE_SIZE)
	override pageSize: number = DEFAULT_PIPELINE_PAGE_SIZE;
}

export { ListDealPipelineStageQueryValidator };
