import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { USER_ROLES } from '../../../../shared/domain/enums/user-role.enum.js';
import { AccessGroupSummaryDto } from './access-group-summary.dto.js';

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

	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description:
			'Grupo de acesso vinculado ao utilizador; null se não houver grupo associado.',
	})
	accessGroupId!: string | null;

	@ApiPropertyOptional({
		type: AccessGroupSummaryDto,
		nullable: true,
		description:
			'Regras de acesso e feature toggles vinculados ao utilizador nesta etapa do produto.',
	})
	accessGroup!: AccessGroupSummaryDto | null;
}

export { UserResponseDto };
