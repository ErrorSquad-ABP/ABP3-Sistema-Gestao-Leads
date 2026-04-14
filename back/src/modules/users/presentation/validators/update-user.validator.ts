import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsIn,
	IsOptional,
	IsString,
	IsUUID,
	MinLength,
	ValidateIf,
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

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description: 'Nova equipe; null remove o vínculo.',
	})
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	teamId?: string | null;

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description: 'Novo grupo de acesso; null remove o vínculo.',
	})
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	accessGroupId?: string | null;
}

export { UpdateUserValidator };
