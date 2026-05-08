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

import { DEAL_IMPORTANCES } from '../../../../shared/domain/enums/deal-importance.enum.js';
import { DEAL_STATUSES } from '../../../../shared/domain/enums/deal-status.enum.js';

const DEFAULT_PIPELINE_PAGE_SIZE = 5;
const MAX_PIPELINE_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 120;

const VALUE_SORT_OPTS = ['asc', 'desc'] as const;

class ListDealPipelineQueryValidator {
	@ApiPropertyOptional({ enum: DEAL_STATUSES })
	@IsOptional()
	@IsString()
	@IsIn(DEAL_STATUSES)
	status?: string;

	@ApiPropertyOptional({ enum: DEAL_IMPORTANCES })
	@IsOptional()
	@IsString()
	@IsIn(DEAL_IMPORTANCES)
	importance?: string;

	@ApiPropertyOptional({
		description: 'Termo de busca por título, cliente ou veículo.',
		maxLength: MAX_SEARCH_LENGTH,
	})
	@IsOptional()
	@IsString()
	@MaxLength(MAX_SEARCH_LENGTH)
	search?: string;

	@ApiPropertyOptional({
		description:
			'Ordenação por valor dentro de cada etapa: asc (menor primeiro) ou desc (maior primeiro). Sem este parâmetro, ordena por data de criação (mais recentes primeiro).',
		enum: [...VALUE_SORT_OPTS],
	})
	@IsOptional()
	@IsString()
	@IsIn([...VALUE_SORT_OPTS])
	valueSort?: string;

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
