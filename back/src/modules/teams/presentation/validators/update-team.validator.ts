import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator';

class UpdateTeamValidator {
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
}

export { UpdateTeamValidator };
