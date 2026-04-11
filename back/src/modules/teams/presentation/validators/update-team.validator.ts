import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	IsUUID,
	MinLength,
	ValidateIf,
} from 'class-validator';

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
		nullable: true,
		description:
			'Gerente da equipe; omita ou use null para equipe sem gerente.',
	})
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	managerId?: string | null;

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description:
			'Loja vinculada a equipe; omita para manter o valor atual ou use null para remover o vinculo.',
	})
	@IsOptional()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	storeId?: string | null;
}

export { UpdateTeamValidator };
