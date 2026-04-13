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
