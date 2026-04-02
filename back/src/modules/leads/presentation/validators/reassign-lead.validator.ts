import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, ValidateIf } from 'class-validator';

class ReassignLeadValidator {
	@ApiPropertyOptional({
		format: 'uuid',
		nullable: true,
		description: 'Novo responsável; omita ou use null para remover o dono.',
	})
	@ValidateIf((_, value) => value !== null && value !== undefined)
	@IsUUID()
	ownerUserId!: string | null;
}

export { ReassignLeadValidator };
