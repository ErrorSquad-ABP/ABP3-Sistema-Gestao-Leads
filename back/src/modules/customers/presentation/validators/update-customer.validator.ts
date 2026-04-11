import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateIf,
} from 'class-validator';

class UpdateCustomerValidator {
	@ApiPropertyOptional({ example: 'João Silva' })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string;

	@ApiPropertyOptional({
		format: 'email',
		example: 'joao@example.com',
		nullable: true,
	})
	@IsOptional()
	@ValidateIf((o) => o.email !== null)
	@IsEmail()
	email?: string | null;

	@ApiPropertyOptional({ example: '+5511987654321', nullable: true })
	@IsOptional()
	@ValidateIf((o) => o.phone !== null)
	@IsString()
	phone?: string | null;

	@ApiPropertyOptional({
		example: '12345678901',
		description:
			'CPF normalizado (11 dígitos) ou formatado; será validado e normalizado.',
		nullable: true,
	})
	@IsOptional()
	@ValidateIf((o) => o.cpf !== null)
	@IsString()
	cpf?: string | null;
}

export { UpdateCustomerValidator };
