import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '../../../users/application/dto/user-response.dto.js';

class LoginResponseDto {
	@ApiProperty({ type: UserResponseDto })
	user!: UserResponseDto;

	@ApiProperty({
		description:
			'Access JWT (também enviado em cookie HttpOnly). Sem refresh token: re-login após expiração.',
	})
	accessToken!: string;
}

export { LoginResponseDto };
