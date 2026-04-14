import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	ArrayMinSize,
	IsArray,
	IsIn,
	IsOptional,
	IsString,
	MinLength,
	ValidateIf,
} from 'class-validator';

import { USER_ROLES } from '../../../../shared/domain/enums/user-role.enum.js';

const USER_ROLE_VALUES = [...USER_ROLES] as string[];
const ACCESS_FEATURE_VALUES = [
	'dashboardOperational',
	'dashboardAnalytic',
	'leads',
	'users',
	'profile',
	'credentials',
	'reports',
	'exports',
] as const;

class UpdateAccessGroupValidator {
	@ApiPropertyOptional({ example: 'Gerentes regionais' })
	@IsOptional()
	@IsString()
	@MinLength(1)
	name?: string;

	@ApiPropertyOptional({
		example: 'Grupo com foco em leitura analítica, relatórios e gestão tática.',
	})
	@IsOptional()
	@IsString()
	@MinLength(1)
	description?: string;

	@ApiPropertyOptional({
		enum: USER_ROLES,
		nullable: true,
		description: 'Papel canônico do backend ao qual este grupo se vincula.',
	})
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsIn(USER_ROLE_VALUES)
	baseRole?: string | null;

	@ApiPropertyOptional({
		type: [String],
		example: ['dashboardOperational', 'reports', 'exports'],
	})
	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@IsIn(ACCESS_FEATURE_VALUES, { each: true })
	featureKeys?: string[];
}

export { UpdateAccessGroupValidator };
