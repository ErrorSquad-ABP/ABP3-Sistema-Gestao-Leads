import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MinLength,
	ValidateIf,
} from 'class-validator';

import { USER_ROLES } from '../../../../shared/domain/enums/user-role.enum.js';

const USER_ROLE_VALUES = [...USER_ROLES] as string[];

class CreateUserValidator {
	@ApiProperty({ example: 'Maria Silva' })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ format: 'email', example: 'maria@example.com' })
	@IsEmail()
	email!: string;

	@ApiProperty({
		minLength: 8,
		description: 'Senha em texto plano; armazenada apenas como hash Argon2.',
	})
	@IsString()
	@MinLength(8)
	password!: string;

	@ApiProperty({
		enum: USER_ROLES,
		example: 'ATTENDANT',
	})
	@IsString()
	@IsIn(USER_ROLE_VALUES)
	role!: string;

	@ApiPropertyOptional({
		type: [String],
		format: 'uuid',
		description:
			'Grupos de acesso vinculados ao usuário; lista vazia ou omitida cria sem grupos.',
	})
	@IsOptional()
	@IsArray()
	@IsUUID(undefined, { each: true })
	accessGroupIds?: string[];

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		deprecated: true,
		description:
			'Legado (compatibilidade): grupo único. Ignorado quando accessGroupIds está presente.',
	})
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	accessGroupId?: string | null;
}

export { CreateUserValidator };
