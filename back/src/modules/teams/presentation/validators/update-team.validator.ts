import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

class UpdateTeamValidator {
	@ApiPropertyOptional({
		example: 'Equipe Comercial',
	})
	@IsOptional()
	@IsString()
	@MinLength(1)
	name?: string;

	@ApiPropertyOptional({
		format: 'uuid',
		description: 'Nova loja vinculada à equipe.',
	})
	@IsOptional()
	@IsUUID()
	storeId?: string;
}

export { UpdateTeamValidator };
