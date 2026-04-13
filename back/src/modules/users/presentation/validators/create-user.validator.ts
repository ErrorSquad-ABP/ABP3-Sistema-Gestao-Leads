import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsString,
	MinLength,
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
}

export { CreateUserValidator };
