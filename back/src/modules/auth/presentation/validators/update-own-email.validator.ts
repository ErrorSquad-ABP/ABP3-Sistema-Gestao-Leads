import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

class UpdateOwnEmailValidator {
	@ApiProperty({
		minLength: 1,
		description: 'Senha atual para confirmar a alteração.',
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	currentPassword!: string;

	@ApiProperty({ format: 'email', example: 'maria@example.com' })
	@IsEmail()
	email!: string;
}

export { UpdateOwnEmailValidator };
