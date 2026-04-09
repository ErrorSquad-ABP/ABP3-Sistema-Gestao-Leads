import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

class LoginValidator {
	@ApiProperty({ format: 'email', example: 'maria@example.com' })
	@IsEmail()
	email!: string;

	@ApiProperty({ minLength: 8 })
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	password!: string;
}

export { LoginValidator };
