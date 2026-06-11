import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

class ListTeamMemberCandidatesValidator {
	@ApiProperty({
		format: 'uuid',
		description:
			'Loja usada para filtrar candidatos elegiveis para uma equipe.',
	})
	@IsUUID()
	storeId!: string;
}

export { ListTeamMemberCandidatesValidator };
