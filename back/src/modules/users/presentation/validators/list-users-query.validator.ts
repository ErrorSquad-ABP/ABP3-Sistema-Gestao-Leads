import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

class ListUsersQueryValidator {
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
		description: 'Itens por página (máximo 100).',
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

export { ListUsersQueryValidator };
