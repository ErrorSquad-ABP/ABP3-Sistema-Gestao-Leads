import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { USER_ROLES } from '../../../../shared/domain/enums/user-role.enum.js';

class AccessGroupSummaryDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Grupo administrativo' })
	name!: string;

	@ApiProperty({
		example: 'Controla acessos, perfis e áreas críticas do produto.',
	})
	description!: string;

	@ApiPropertyOptional({
		enum: USER_ROLES,
		nullable: true,
		description:
			'Papel canônico vinculado ao grupo. Null quando o grupo ainda não conversa com o RBAC fixo do backend.',
	})
	baseRole!: string | null;

	@ApiProperty({
		type: [String],
		example: ['dashboardOperational', 'users', 'reports'],
	})
	featureKeys!: string[];

	@ApiProperty({ example: false })
	isSystemGroup!: boolean;
}

export { AccessGroupSummaryDto };
