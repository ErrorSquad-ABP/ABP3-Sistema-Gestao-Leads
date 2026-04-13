import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsIn,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

import { USER_ROLES } from '../../../../shared/domain/enums/user-role.enum.js';

const USER_ROLE_VALUES = [...USER_ROLES] as string[];

class UpdateUserValidator {
	@ApiPropertyOptional({ example: 'Maria Silva' })
	@IsOptional()
	@IsString()
	@MinLength(1)
	name?: string;

	@ApiPropertyOptional({ format: 'email' })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({
		minLength: 8,
		description: 'Nova senha; omita para manter a atual.',
	})
	@IsOptional()
	@IsString()
	@MinLength(8)
	password?: string;

	@ApiPropertyOptional({ enum: USER_ROLES })
	@IsOptional()
	@IsString()
	@IsIn(USER_ROLE_VALUES)
	role?: string;
}

export { UpdateUserValidator };
