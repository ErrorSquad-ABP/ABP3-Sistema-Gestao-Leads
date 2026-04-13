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

	@ApiPropertyOptional({
		example: '11999999999',
		nullable: true,
	})
	phone!: string | null;

	@ApiPropertyOptional({
		example: '12345678901',
		nullable: true,
	})
	cpf!: string | null;
}

export { CustomerResponseDto };
