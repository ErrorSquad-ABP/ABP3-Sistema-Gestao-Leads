import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '../../../users/application/dto/user-response.dto.js';

class LoginResponseDto {
	@ApiProperty({ type: UserResponseDto })
	user!: UserResponseDto;

	@ApiProperty({
		description:
			'Access JWT (também em cookie HttpOnly). Refresh opaco só em cookie HttpOnly (não vem no JSON).',
	})
	accessToken!: string;
}

export { LoginResponseDto };
