import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, ValidateIf } from 'class-validator';

class AssignTeamManagerValidator {
	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description:
			'Uuid do gerente ou null para remover. A chave deve ser enviada.',
	})
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	managerId?: string | null;
}

export { AssignTeamManagerValidator };
