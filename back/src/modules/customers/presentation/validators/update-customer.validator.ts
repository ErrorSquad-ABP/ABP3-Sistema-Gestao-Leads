import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, ValidateIf } from 'class-validator';

class UpdateCustomerValidator {
	@ApiPropertyOptional({ example: 'Maria Silva' })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ format: 'email', nullable: true })
	@ValidateIf((_, value) => value !== undefined && value !== null)
	@IsEmail()
	email?: string | null;

	@ApiPropertyOptional({ nullable: true })
	@ValidateIf((_, value) => value !== undefined && value !== null)
	@IsString()
	phone?: string | null;

	@ApiPropertyOptional({
		nullable: true,
		description: 'CPF sem pontuação, 11 dígitos.',
	})
	@ValidateIf((_, value) => value !== undefined && value !== null)
	@IsString()
	cpf?: string | null;
}

export { UpdateCustomerValidator };
