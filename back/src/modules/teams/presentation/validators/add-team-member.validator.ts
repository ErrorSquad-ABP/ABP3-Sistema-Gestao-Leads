import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

class AddTeamMemberValidator {
	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	userId!: string;
}

export { AddTeamMemberValidator };
