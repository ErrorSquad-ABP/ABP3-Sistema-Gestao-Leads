import { ApiProperty } from '@nestjs/swagger';

class StoreResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Loja Centro' })
	name!: string;
}

export { StoreResponseDto };
