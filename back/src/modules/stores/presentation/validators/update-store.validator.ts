import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

class UpdateStoreValidator {
	@ApiPropertyOptional({
		example: 'Loja Centro',
	})
	@IsOptional()
	@IsString()
	@MinLength(1)
	name?: string;
}

export { UpdateStoreValidator };
