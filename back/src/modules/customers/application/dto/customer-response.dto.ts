import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CustomerResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Maria Silva' })
	name!: string;

	@ApiPropertyOptional({ format: 'email', nullable: true })
	email!: string | null;

	@ApiPropertyOptional({ nullable: true, example: '11999999999' })
	phone!: string | null;

	@ApiPropertyOptional({ nullable: true, example: '12345678901' })
	cpf!: string | null;
}

export { CustomerResponseDto };
