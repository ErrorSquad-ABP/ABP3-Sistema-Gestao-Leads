import { ApiProperty } from '@nestjs/swagger';

class TeamMemberCandidateResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ example: 'Maria Silva' })
	name!: string;

	@ApiProperty({ format: 'email', example: 'maria@example.com' })
	email!: string;
}

export { TeamMemberCandidateResponseDto };
