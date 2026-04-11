import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator';

class CreateTeamValidator {
	@ApiProperty({
		example: 'Equipe Comercial',
	})
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description:
			'Gerente da equipe; omita ou use null para equipe sem gerente.',
	})
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	managerId!: string | null;

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description:
			'Loja vinculada a equipe; omita ou use null para equipe ainda sem loja definida.',
	})
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	storeId!: string | null;
}

export { CreateTeamValidator };
