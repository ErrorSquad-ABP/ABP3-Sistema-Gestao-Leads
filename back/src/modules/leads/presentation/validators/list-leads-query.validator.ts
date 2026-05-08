import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBooleanString, IsInt, IsOptional, Max, Min } from 'class-validator';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;

class ListLeadsQueryValidator {
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
		description: 'Itens por página (máximo 10).',
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

	@ApiPropertyOptional({
		description: 'Quando true, retorna apenas leads sem negociação aberta.',
		example: 'true',
	})
	@IsOptional()
	@IsBooleanString()
	withoutOpenDeal?: string;
}

export { ListLeadsQueryValidator };
