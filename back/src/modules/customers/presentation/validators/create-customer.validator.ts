import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateCustomerValidator {
	@ApiProperty({ example: 'João Silva' })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiPropertyOptional({ format: 'email', example: 'joao@example.com' })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ example: '+5511987654321' })
	@IsOptional()
	@IsString()
	phone?: string;

	@ApiPropertyOptional({
		example: '12345678901',
		description:
			'CPF normalizado (11 dígitos) ou formatado; será validado e normalizado.',
	})
	@IsOptional()
	@IsString()
	cpf?: string;
}

export { CreateCustomerValidator };
