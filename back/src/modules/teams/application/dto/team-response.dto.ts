import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TeamResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Equipe Comercial' })
	name!: string;

	@ApiProperty({ format: 'uuid' })
	storeId!: string;

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description:
			'Gerente da equipe (relação TeamManager); independente da lista de membros.',
	})
	managerId!: string | null;

	@ApiProperty({
		type: [String],
		format: 'uuid',
		description: 'Usuários membros da equipe (relação TeamMembers).',
	})
	memberUserIds!: string[];
}

export { TeamResponseDto };
