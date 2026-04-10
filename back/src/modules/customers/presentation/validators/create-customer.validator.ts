import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

class CreateCustomerValidator {
	@ApiProperty({ example: 'Maria Silva' })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiPropertyOptional({ format: 'email', nullable: true })
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsEmail()
	email?: string | null;

	@ApiPropertyOptional({ nullable: true })
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	phone?: string | null;

	@ApiPropertyOptional({
		nullable: true,
		description: 'CPF sem pontuação, 11 dígitos.',
	})
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsString()
	cpf?: string | null;
}

export { CreateCustomerValidator };
