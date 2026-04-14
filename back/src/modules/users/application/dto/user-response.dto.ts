import { ApiProperty } from '@nestjs/swagger';

import { USER_ROLES } from '../../../../shared/domain/enums/user-role.enum.js';

class UserResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Maria Silva' })
	name!: string;

	@ApiProperty({ format: 'email', example: 'maria@example.com' })
	email!: string;

	@ApiProperty({
		enum: USER_ROLES,
		example: 'ATTENDANT',
		description: 'Papel no domínio (ADMINISTRATOR mapeia para ADMIN no banco).',
	})
	role!: string;

	@ApiProperty({
		format: 'uuid',
		nullable: true,
		deprecated: true,
		description:
			'Legado (compatibilidade): identificador estável derivado dos vínculos atuais — primeiro time como membro (ordenado por UUID); se não houver, primeiro time gerenciado; senão null. Clientes novos devem usar memberTeamIds e managedTeamIds.',
	})
	teamId!: string | null;

	@ApiProperty({
		type: [String],
		format: 'uuid',
		description: 'Equipes das quais o usuário é membro.',
	})
	memberTeamIds!: string[];

	@ApiProperty({
		type: [String],
		format: 'uuid',
		description: 'Equipes que o usuário gerencia.',
	})
	managedTeamIds!: string[];
}

export { UserResponseDto };
