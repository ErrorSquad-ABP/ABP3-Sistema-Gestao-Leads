import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description: 'Equipe opcional; null se o usuário não pertence a time.',
	})
	teamId!: string | null;
}

export { UserResponseDto };
