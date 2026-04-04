import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TeamResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Equipe Comercial' })
	name!: string;

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description: 'Usuario gerente responsavel pela equipe.',
	})
	managerId!: string | null;
}

export { TeamResponseDto };
