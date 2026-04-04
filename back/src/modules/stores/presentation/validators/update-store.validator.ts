import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class UpdateStoreValidator {
	@ApiProperty({
		example: 'Loja Centro',
	})
	@IsString()
	@IsNotEmpty()
	name!: string;
}

export { UpdateStoreValidator };
