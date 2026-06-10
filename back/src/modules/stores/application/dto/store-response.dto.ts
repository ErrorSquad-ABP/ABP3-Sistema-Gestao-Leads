import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class StoreResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Loja Centro' })
	name!: string;

	@ApiPropertyOptional({ example: 'Av. Andrômeda, 885', nullable: true })
	addressLine!: string | null;

	@ApiPropertyOptional({ example: 'São José dos Campos', nullable: true })
	city!: string | null;

	@ApiPropertyOptional({ example: 'SP', nullable: true })
	state!: string | null;

	@ApiPropertyOptional({ example: 'São José dos Campos - SP', nullable: true })
	region!: string | null;

	@ApiPropertyOptional({ example: 'Sudeste', nullable: true })
	distributionRegion!: string | null;

	@ApiPropertyOptional({ example: 'SP', nullable: true })
	coverage!: string | null;

	@ApiPropertyOptional({
		example: 'Abrangência: São José dos Campos, Jacareí e região.',
		nullable: true,
	})
	scope!: string | null;
}

export { StoreResponseDto };
