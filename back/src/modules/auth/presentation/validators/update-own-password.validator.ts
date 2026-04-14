import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

class UpdateOwnPasswordValidator {
	@ApiProperty({ minLength: 1, description: 'Senha atual.' })
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	currentPassword!: string;

	@ApiProperty({
		minLength: 8,
		maxLength: 128,
		description: 'Nova senha (Argon2id no servidor).',
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(128)
	newPassword!: string;
}

export { UpdateOwnPasswordValidator };
