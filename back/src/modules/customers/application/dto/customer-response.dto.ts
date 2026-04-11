import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CustomerResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'João Silva' })
	name!: string;

	@ApiPropertyOptional({
		format: 'email',
		example: 'joao@example.com',
		nullable: true,
	})
	email!: string | null;

	@ApiPropertyOptional({ example: '+5511987654321', nullable: true })
	phone!: string | null;

	@ApiPropertyOptional({
		example: '12345678901',
		nullable: true,
		description: 'CPF normalizado (11 dígitos, sem formatação).',
	})
	cpf!: string | null;
}

export { CustomerResponseDto };
