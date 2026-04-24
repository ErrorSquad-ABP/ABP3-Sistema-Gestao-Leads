import { ApiProperty } from '@nestjs/swagger';

class LeadCatalogOwnerDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Maria Silva' })
	name!: string;

	@ApiProperty({ format: 'email', example: 'maria@example.com' })
	email!: string;

	@ApiProperty({
		type: [String],
		format: 'uuid',
		description:
			'Lojas em que o utilizador atua via vínculo de membro ou gerente de equipe.',
	})
	storeIds!: string[];
}

export { LeadCatalogOwnerDto };
