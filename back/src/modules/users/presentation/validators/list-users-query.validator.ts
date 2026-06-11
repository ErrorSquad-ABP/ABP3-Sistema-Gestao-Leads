import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
} from 'class-validator';

import { USER_ROLES } from '../../../../shared/domain/enums/user-role.enum.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 120;

const USER_ROLE_VALUES = [...USER_ROLES] as string[];

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

	@ApiPropertyOptional({
		description: 'Busca por nome ou e-mail (case-insensitive).',
		maxLength: MAX_SEARCH_LENGTH,
	})
	@IsOptional()
	@IsString()
	@MaxLength(MAX_SEARCH_LENGTH)
	search?: string;

	@ApiPropertyOptional({
		enum: USER_ROLES,
		description: 'Filtra pelo papel canônico.',
	})
	@IsOptional()
	@IsString()
	@IsIn(USER_ROLE_VALUES)
	role?: string;

	@ApiPropertyOptional({
		format: 'uuid',
		description: 'Filtra usuários vinculados a um grupo de acesso.',
	})
	@IsOptional()
	@IsUUID()
	accessGroupId?: string;
}

export { ListUsersQueryValidator };
