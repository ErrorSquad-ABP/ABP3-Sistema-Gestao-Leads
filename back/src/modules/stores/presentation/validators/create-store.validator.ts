import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateStoreValidator {
	@ApiProperty({
		example: 'Loja Centro',
	})
	@IsString()
	@IsNotEmpty()
	name!: string;
}

export { CreateStoreValidator };
