import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator';

class CreateTeamValidator {
	@ApiProperty({
		example: 'Equipe Comercial',
	})
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({
		format: 'uuid',
		description: 'Loja obrigatória (FK em Team).',
	})
	@IsUUID()
	storeId!: string;

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
		type: [String],
		description: 'Usuários que serão conectados como membros na criação.',
	})
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	initialMemberUserIds?: string[];
}

export { CreateTeamValidator };
